import api, { route } from "@forge/api";
import { convert } from "adf-to-md";
import { retext } from "retext";
import retextPos from "retext-pos";
import retextKeywords from "retext-keywords";

export async function getKeywordGraphs() {
    const links = []
    let cursor = null;

    while (true) {
        let url = null
        if (cursor) {
            url = route`/wiki/api/v2/pages?body-format=atlas_doc_format&limit=100&cursor=${cursor}`
        } else {
            url = route`/wiki/api/v2/pages?body-format=atlas_doc_format&limit=100`
        }

        const response = await api.asApp().requestConfluence(
            url,
            {
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        const result = await response.json()
        let keywordMap = new Map()

        for (const d of result.results) {
            try {
                const doc = convert(JSON.parse(d.body.atlas_doc_format.value))
                const body = doc.result.replace(/(\r\n|\n|\r)/gm, "")

                const file = await retext()
                    .use(retextPos) // Make sure to use `retext-pos` before `retext-keywords`.
                    .use(retextKeywords)
                    .process(body)

                file.data.keywords.sort((a, b) => b.score - a.score || b.matches.length - a.matches.length);
                const keywords = file.data.keywords.slice(0, 5);
                if (file.data.keywords) {
                    for (const keyword of keywords) {
                        const word = keyword.stem
                        const docIds = keywordMap.get(word)
                        if (docIds) {
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
                    }
                }

            } catch (e) {
                console.log(e)
            }
        }

        // 다음 페이지 존재 확인
        if (!result._links?.next) {
            break
        }

        // 다음 페이지 cursor
        const searchParams = new URLSearchParams(result._links?.next.split('?')[1]);
        cursor = searchParams.get('cursor'); // page cursor
        console.log('after iteration', cursor)
    }

    return links;

}

export async function getNodes() {
    const systemInfo = await api.asApp().requestConfluence(route`/wiki/rest/api/settings/systemInfo`, {
        headers: {
            'Accept': 'application/json'
        }
    });
    const systemInfoResponse = await systemInfo.json()
    const baseUrl = systemInfoResponse.baseUrl

    const docs = []
    let cursor = null;

    while (true) {
        let url = null
        if (cursor) {
            url = route`/wiki/api/v2/pages?body-format=atlas_doc_format&limit=100&cursor=${cursor}`
        } else {
            url = route`/wiki/api/v2/pages?body-format=atlas_doc_format&limit=100`
        }

        const response = await api.asApp().requestConfluence(
            url,
            {
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        const result = await response.json()

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

        // 다음 페이지 존재 확인
        if (!result._links?.next) {
            break
        }

        // 다음 페이지 cursor
        const searchParams = new URLSearchParams(result._links?.next.split('?')[1]);
        cursor = searchParams.get('cursor'); // page cursor
    }

    return docs
}

export async function searchByAPI(searchWord) {
    const cql = `type = page and text ~ "${searchWord}"`;
    const response = await api.asApp().requestConfluence(route`/wiki/rest/api/search?cql=${cql}`, {
        headers: {
            'Accept': 'application/json'
        }
    });
    const result = await response.json()

    let pages = []
    for (const page of result.results) {
        pages.push(
            page.content.id
        )
    }

    return pages;
}

export async function getUserInfo(accountId) {
    const response = await api.asApp().requestConfluence(route`/wiki/rest/api/user?accountId=${accountId}`, {
        headers: {
            'Accept': 'application/json'
        }
    });
    const result = await response.json()
    return result.displayName;
}

export async function getAllRootPagesInSpace(spaceId, depth = 'root') {
    let allResults = [];
    let cursor = null;

    while (true) {
        let url = null
        if (cursor) {
            url = route`/wiki/api/v2/spaces/${spaceId}/pages?depth=${depth}&limit=100&cursor=${cursor}`
        } else {
            url = route`/wiki/api/v2/spaces/${spaceId}/pages?depth=${depth}&limit=100`
        }

        const result = await api.asApp().requestConfluence(
            url,
            {
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => response.json())

        allResults = [...allResults, ...result.results];

        // 다음 페이지 존재 확인
        if (!result._links?.next) {
            break
        }

        // 다음 페이지 cursor
        const searchParams = new URLSearchParams(result._links?.next.split('?')[1]);
        cursor = searchParams.get('cursor'); // page cursor
    }

    return allResults;
}

export async function getAllChildrenPages(pageId) {
    let allResults = [];
    let cursor = null;

    while (true) {
        let url = null
        if (cursor) {
            url = route`/wiki/api/v2/pages/${pageId}/children?limit=100&cursor=${cursor}`
        } else {
            url = route`/wiki/api/v2/pages/${pageId}/children?limit=100`
        }

        let result = await api.asApp().requestConfluence(
            url,
            {
                headers: {
                    'Accept': 'application/json'
                }
            }
        ).then(response => response.json())

        result = result.results.map(page => ({parentId: pageId, ...page}))

        allResults = [...allResults, ...result];

        // 다음 페이지 존재 확인
        if (!result._links?.next) {
            break
        }

        // 다음 페이지 cursor
        const searchParams = new URLSearchParams(result._links?.next.split('?')[1]);
        cursor = searchParams.get('cursor'); // page cursor
    }

    return allResults;
}

export async function getHierarchy() {
    const response = await api.asApp().requestConfluence(route`/wiki/api/v2/spaces`, {
        headers: {
            'Accept': 'application/json'
        }
    }).then(res => res.json());

    const promises = response.results.map(space => {
        return getAllRootPagesInSpace(space.id, 'root');
    });
    const rootPages = await Promise.all(promises);
    let parentPages = rootPages.flat().map(page => page.id);

    const links = [];
    while (parentPages.length > 0) {
        const promises = parentPages.map((parentId) => {
            return getAllChildrenPages(parentId);
        });

        let childrenPages = await Promise.all(promises);
        parentPages = [];

        childrenPages.forEach(child => {
            child.forEach(childPage => {
                links.push({
                    source: childPage.parentId,
                    target: childPage.id,
                    type: 'hierarchy',
                });
                parentPages.push(childPage.id);
            })
        });
    }

    return links
}

export async function getLabels() {
    let links = []
    let cursor = null;
    while (true) {
        let url = null
        if (cursor) {
            url = route`/wiki/api/v2/labels?limit=100&cursor=${cursor}`
        } else {
            url = route`/wiki/api/v2/labels?limit=100`
        }

        const response = await api.asApp().requestConfluence(url, {
            headers: {
                'Accept': 'application/json'
            }
        });

        const result = await response.json()

        if (result.results?.length === 0) {
            break
        }

        let promises = result.results.map((label) => {
            return new Promise((resolve, reject) => {
                const labelId = label.id
                api.asApp().requestConfluence(route`/wiki/api/v2/labels/${labelId}/pages`, {
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
                        for (let i = 0; i < response.results.length; i++) {
                            for (let j = i + 1; j < response.results.length; j++) {
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
        if (!result._links?.next) {
            break
        }

        // 다음 페이지 cursor
        const searchParams = new URLSearchParams(result._links?.next.split('?')[1]);
        cursor = searchParams.get('cursor'); // page cursor
    }

    return links
}

export const fetchPageInfos = async () => {
    let pageInfo = undefined;
    
      const response = await api.asUser().requestConfluence(route`/wiki/api/v2/pages?body-format=atlas_doc_format`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      const pageInfos = []
      if (response.ok) {
        const responseJson = await response.json();
        for (const d of responseJson.results) {
            const content = d.body['atlas_doc_format'].value;
            pageInfo = {
              id: d.id,
              title: d.title,
              content: content            
            }

            pageInfos.push(pageInfo)
        }
      } else {
        console.error(`fetchPageOrBlogInfo: Error: ${response.status} ${response.statusText}`);
      }
   
    return pageInfos;
  }

export const getDocumentInfo = async (pageId) => {
    try {
        const response = await api
            .asApp()
            .requestConfluence(route`/wiki/rest/api/content/${pageId}`, {
                headers: {
                    Accept: 'application/json',
                },
            });

        if (response.ok) {
            const data = await response.json();
            const title = data.title;
            const url = data._links.base + data._links.webui;
            const status = data.status;
            const authorName = data.history.createdBy.username;
            const createdAt = data.createdDate;
            return { title, url, status, authorName, createdAt };
        } else {
            console.error(`Error in getDocumentInfo: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to fetch document info: ${pageId} ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error in getDocumentInfo: ${error.message}`);
        throw error;
    }
  };
