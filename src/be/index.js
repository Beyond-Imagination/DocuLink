import Resolver from '@forge/resolver';
import api, {route, storage} from "@forge/api";
import { convert } from "adf-to-md";
import { toString } from 'nlcst-to-string';
import { retext } from 'retext';
import retextKeywords from 'retext-keywords';
import retextPos from 'retext-pos';

const resolver = new Resolver();

resolver.define('getNodes', async (req) => {
  let graphs = await storage.get('nodes');

  if (!graphs) {
    graphs = await getNodes(graphs);
    await storage.set('nodes', graphs);
  }

  return graphs;
});

resolver.define('getKeywordGraphs', async (req) => {
  let graphs = await storage.get('keyword');

  if (!graphs) {
    graphs = await getKeywordGraphs()
    await storage.set('keyword', graphs);
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

export const nodesTrigger = async ({ context }) => {
  await storage.set('nodes', await getNodes());
};

export const trigger = async ({ context }) => {
  console.log('Scheduled trigger invoked');
  console.log(context);

  await storage.set('keyword', await getKeywordGraphs());

  // Add your business logic here
};

async function getKeywordGraphs() {
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
                type: 'keyword',
              })
            })
          } else {
            keywordMap.set(word, [d.id])
          }

          keywords.push(word)
        }
      }
      const docUrl = baseUrl + d._links.webui
      const authorName = await getUserInfo(d.authorId)
      const createdAt = new Date(d.createdAt).toLocaleDateString()

      docs.push({
        id: d.id,
        title: d.title,
        // body: body,
        keywords: keywords,
        searched: false,
        url: docUrl,
        authorName: authorName,
        status: d.status,
        createdAt: createdAt
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

async function getNodes() {
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

  for (const d of result.results) {
    try {
      const docUrl = baseUrl + d._links.webui
      const authorName = await getUserInfo(d.authorId)
      const createdAt = new Date(d.createdAt).toLocaleDateString()

      docs.push({
        id: d.id,
        title: d.title,
        // body: body,
        searched: false,
        url: docUrl,
        authorName: authorName,
        status: d.status,
        createdAt: createdAt
      })
    } catch (e) {
      console.log(e)
    }
  }

  return {
    nodes: docs,
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

async function getUserInfo(accountId) {
  const response = await api.asUser().requestConfluence(route`/wiki/rest/api/user?accountId=${accountId}`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  const result = await response.json()
  return result.displayName;
}

resolver.define('getHierarchy', async (req) => {
  let graphs = await storage.get('hierarchy');

  if (!graphs) {
    graphs = await getHierarchy()
    await storage.set('hierarchy', graphs);
  }

  return graphs;
})

export const hierarchyTrigger = async ({ context }) => {
  await storage.set('hierarchy', await getHierarchy());
};

async function getAllRootPagesInSpace(spaceId, depth = 'root') {
  let allResults = [];
  let cursor = null;

  while (true) {
    const result = new Promise((resolve, reject) => {
      api.asApp().requestConfluence(
        route`/wiki/api/v2/spaces/${spaceId}/pages?depth=${depth}&limit=100${cursor ? `&cursor=${cursor}` : ''}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        })
        .then(response => resolve(response.json()))
        .catch(error => {
          reject(error);
        });
    });

    allResults = [...allResults, ...result.results];

    if (!result._links?.next) {
      break;
    }

    const nextUrl = new URL(result._links.next);
    cursor = nextUrl.searchParams.get('cursor');
  }

  return allResults;
}

async function getAllChildrenPages(pageId) {
  let allResults = [];
  let cursor = null;
  
  while (true) {
    const result = new Promise((resolve, reject) => {
      api.asApp().requestConfluence(
        route`/wiki/api/v2/pages/${pageId}/children?limit=100${cursor ? `&cursor=${cursor}` : ''}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      )
        .then(response =>
          resolve(response.json()))
        .catch(error => {
          reject(error);
        });
    });

    allResults = [...allResults, ...result.results];

    if (!result._links?.next) {
      break;
    }

    const nextUrl = new URL(result._links.next);
    cursor = nextUrl.searchParams.get('cursor');
  }

  return allResults;
}

async function getHierarchy() {
  const response = await api.asApp().requestConfluence(route`/wiki/api/v2/spaces`, {
    headers: {
      'Accept': 'application/json'
    }
  }).then(res => res.json());

  const promises = response.results.map(space => { return getAllRootPagesInSpace(space.id, 'root'); });
  const rootPages = await Promise.all(promises).flat();

  let parentPages = rootPages.map(page => page.id);

  const links = [];
  while (parentPages.length > 0) {
    const promises = parentPages.map((parentId) => {
      return getAllChildrenPages(parentId);
    });

    let childrenPages = await Promise.all(promises);
    parentPages = [];

    childrenPages.forEach(child => {
      links.push({
        source: parentId,
        target: child.id,
        type: 'hierarchy',
      });
      parentPages.push(child.id);
    });
  }

  return {
    links: links,
  }
}

export const labelsTrigger = async ({ context }) => {
  await storage.set('labels', await getLabels());
};

resolver.define('getLabels', async (req) => {
  let labels = await storage.get('labels');

  if (!labels) {
    labels = await getLabels();
    await storage.set('labels', labels);
  }

  return labels;
});

async function getLabels() {
  let links = []
  let cursor = null;
  while(true) {
    let r = null
    if (cursor) {
      r = route`/wiki/api/v2/labels?limit=100&cursor=${cursor}`
    } else {
      r = route`/wiki/api/v2/labels?limit=100`
    }

    const response = await api.asApp().requestConfluence(r, {
      headers: {
        'Accept': 'application/json'
      }
    });

    const result = await response.json()

    if(result.results?.length === 0) {
      break
    }

    let promises = result.results.map((label) => {
      return new Promise((resolve, reject) => {
        const labelId = label.id
        const response = api.asUser().requestConfluence(route`/wiki/api/v2/labels/${labelId}/pages`, {
          headers: {
            'Accept': 'application/json'
          }
        })
          .then(res => res.json())
          .then(response => {
            if (response.results.length <= 1) {
              resolve([])
            }

            let pageLinks = []
            for(let i=0; i<response.results.length; i++){
              for(let j=i+1; j<response.results.length; j++) {
                pageLinks.push({
                  source: response.results[i].id,
                  target: response.results[j].id,
                  type: 'labels',
                })
              }
            }

            resolve(pageLinks)
          });
      })
    })

    let pageLinks = await Promise.all(promises);
    pageLinks.forEach(pageLink => {
      links.push(...pageLink)
    })

    // 다음 페이지 존재 확인
    if(!result._links?.next) {
      break
    }

    // 다음 페이지 cursor
    const searchParams = new URLSearchParams(result._links?.next.split('?')[1]);
    cursor = searchParams.get('cursor'); // page cursor
  }

  return links
}
