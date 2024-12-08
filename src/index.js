import Resolver from '@forge/resolver';
import api, { route, storage } from "@forge/api";
import { convert } from "adf-to-md";
import {toString} from 'nlcst-to-string'
import {retext} from 'retext'
import retextKeywords from 'retext-keywords'
import retextPos from 'retext-pos'

const resolver = new Resolver();

resolver.define('getGraphs', async (req) => {
  let graphs = await storage.get('graphs');

  if (!graphs) {
    graphs = await getGraphs()
    await storage.set('graphs', graphs);
  }

  return graphs;
});

resolver.define('retrieveKeywords', async (req) => {
  try {
    const docs = (await storage.get('docs')) || [];
    const links = (await storage.get('links')) || [];

    return { docs, links };
  } catch (error) {
    console.error(`Error in retrieveData: ${error.message}`);
    throw error;
  }
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

  // This is used to get the base URL of the Confluence instance
  const systemInfo = await api.asUser().requestConfluence(route`/wiki/rest/api/settings/systemInfo`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  const systemInfoResponse = await systemInfo.json()
  const baseUrl = systemInfoResponse.baseUrl

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

      const file = await retext()
          .use(retextPos) // Make sure to use `retext-pos` before `retext-keywords`.
          .use(retextKeywords)
          .process(body)

      const keywords = []
      if (file.data.keywords) {
        for (const keyword of file.data.keywords) {
          const word = toString(keyword.matches[0].node)
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

          keywords.push(word)
        }
      }
      const docUrl = baseUrl + d._links.webui

      docs.push({
        id: d.id,
        title: d.title,
        // body: body,
        keywords: keywords,
        searched: false,
        url: docUrl
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

resolver.define('searchByAPI', async (req) => {
  const { searchWord } = req.payload;
  const result = await searchByAPI(searchWord);
  return result;
});

async function searchByAPI(searchWord) {
  const cql = `type = page and text ~ "${searchWord}"`;
  const response = await api.asApp().requestConfluence(route`/wiki/rest/api/search?cql=${cql}`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  const result = await response.json()

  let pages = []
  for(const page of result.results) {
    pages.push(
      page.content.id
    )
  }

  return pages;
}