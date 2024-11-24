import Resolver from '@forge/resolver';
import api, { route, storage } from "@forge/api";
import { convert } from "adf-to-md";

const resolver = new Resolver();

resolver.define('getGraphs', async (req) => {
  let graphs = await storage.get('graphs');

  if (!graphs) {
    graphs = await getGraphs()
    await storage.set('graphs', graphs);
  }

  return graphs;
});


resolver.define('getPage', async (req) => {
  const id = 98413
  const response = await api.asApp().requestConfluence(route`/wiki/api/v2/pages/${id}?body-format=atlas_doc_format`, {
    headers: {
      'Accept': 'application/json'
    }
  });

  const result = await response.json()
  const md = convert(JSON.parse(result.body.atlas_doc_format.value))
  console.log(md)
  //
  // console.log('value', md)

  return result;
});

export const handler = resolver.getDefinitions();

export const trigger = async ({ context }) => {
  console.log('Scheduled trigger invoked');
  console.log(context);

  await storage.set('graphs', await getGraphs());

  // Add your business logic here
};

async function getGraphs() {
  const response = await api.asApp().requestConfluence(route`/wiki/api/v2/pages?body-format=atlas_doc_format&limit=100`, {
    headers: {
      'Accept': 'application/json'
    }
  });

  const result = await response.json()
  const docs = []
  let keywordMap = new Map()
  const links = []
  for (const d of result.results) {
    try {
      const doc = convert(JSON.parse(d.body.atlas_doc_format.value))
      const body = doc.result.replace(/(\r\n|\n|\r)/gm, "")

      const keywords = await extractKeywordsUsingRovo(body)

      for (const word of keywords) {
        const docIds = keywordMap.get(word)
        if(docIds) {
          keywordMap.set(word, [...docIds, d.id])
          docIds.forEach(id => {
            links.push({
              source: id,
              target: d.id,
            })
          })
        } else {
          keywordMap.set(word, [d.id])
        }
      }

      docs.push({
        id: d.id,
        title: d.title,
        keywords: keywords,
      })
    } catch (e) {
      console.log(e)
    }
  }

  return {
    nodes: docs,
    links: links,
  }
}

async function extractKeywordsUsingRovo(text) {
  try {
    const response = await api.asApp().requestConfluence(route`/rovo-agent/extract-keywords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error('Rovo Agent keyword extraction failed.');
    }

    const data = await response.json();
    return data.keywords; 
  } catch (error) {
    console.error(error);
    return [];
  }
}