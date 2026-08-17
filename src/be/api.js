import api, { route } from "@forge/api";

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
