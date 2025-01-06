import api, { route } from "@forge/api";
import { convert } from "adf-to-md";
import { retext } from "retext";
import retextPos from "retext-pos";
import retextKeywords from "retext-keywords";
import { toString } from "nlcst-to-string";

export async function getKeywordGraphs() {
    // This is used to get the base URL of the Confluence instance
    const systemInfo = await api.asUser().requestConfluence(route`/wiki/rest/api/settings/systemInfo`, {
        headers: {
            'Accept': 'application/json'
        }
    });
    const systemInfoResponse = await systemInfo.json()
    const baseUrl = systemInfoResponse.baseUrl

    const docs = []
    const links = []
    let cursor = null;

    while (true) {
        const response = await api.asApp().requestConfluence(
            route`/wiki/api/v2/pages?body-format=atlas_doc_format&limit=100${cursor ? `&cursor=${cursor}` : ''}`,
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

                const keywords = []
                if (file.data.keywords) {
                    for (const keyword of file.data.keywords) {
                        const word = toString(keyword.matches[0].node) // keyword 객체에서 실제 키워드 텍스트를 추출하여 문자열로 변환한 값
                        const docIds = keywordMap.get(word) // 현재 키워드에 해당하는 문서 ID 목록
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

        if (!result._links?.next) {
            break;
        }

        const nextUrl = new URL(result._links.next);
        cursor = nextUrl.searchParams.get('cursor');
    }

    return {
        nodes: docs,
        links: links,
    }

}

export async function getNodes() {
    const systemInfo = await api.asUser().requestConfluence(route`/wiki/rest/api/settings/systemInfo`, {
        headers: {
            'Accept': 'application/json'
        }
    });
    const systemInfoResponse = await systemInfo.json()
    const baseUrl = systemInfoResponse.baseUrl

    const docs = []
    let cursor = null;

    while (true) {
        const response = await api.asApp().requestConfluence(
            route`/wiki/api/v2/pages?body-format=atlas_doc_format&limit=100${cursor ? `&cursor=${cursor}` : ''}`,
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

        if (!result._links?.next) {
            break;
        }

        const nextUrl = new URL(result._links.next);
        cursor = nextUrl.searchParams.get('cursor');
    }

    return {
        nodes: docs,
    }
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
    const response = await api.asUser().requestConfluence(route`/wiki/rest/api/user?accountId=${accountId}`, {
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

export async function getAllChildrenPages(pageId) {
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

export async function getHierarchy() {
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

export async function getLabels() {
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
