import api, { route } from "@forge/api";

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

export const getDocumentInfo = async (contentId) => {
    const response = await api
      .asApp()
      .requestConfluence(route`/wiki/rest/api/content/${contentId}`, {
        headers: {
          Accept: 'application/json',
        },
      });
    if (response.ok) {
      const data = await response.json();
      const title = data.title;
      const url = data._links.base + data._links.webui;
      return { title, url };
    } else {
      console.error(`Error in getDocumentInfo: ${error.message}`);
      throw error;
    }
  };