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
              title: d.title,
              version: d.version.number,
              content: content            
            }

            pageInfos.push(pageInfo)
        }
      } else {
        console.error(`fetchPageOrBlogInfo: Error: ${response.status} ${response.statusText}`);
      }
   
    return pageInfos;
  }

  export const updateContentProperty = async (contentId, propertyId, key, value, version) => {
    console.log(`updateContentProperty: contentId = ${contentId}`);
    console.log(`updateContentProperty: propertyId = ${propertyId}`);
    console.log(`updateContentProperty: key = ${key}`);
    console.log(`updateContentProperty: value = ${value}`);
    console.log(`updateContentProperty: version = ${version}`);
    const response = await api.asUser().requestConfluence(route`/wiki/api/v2/pages/${contentId}/properties/${propertyId}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: key,
        value: value,
        version: {
          number: version,
          message: ''
        }
      })
    });
    if (response.ok) {
      console.log(`updateContentProperty: Response: ${response.status} ${response.statusText}`);
      return await response.json();
    } else {
      await logResponseError('updateContentProperty', response);
    }
  }
  
  export const createContentProperty = async (contentId, key, value) => {
    console.log(`createContentProperty: contentId = ${contentId}`);
    console.log(`createContentProperty: key = ${key}`);
    console.log(`createContentProperty: value = ${value}`);
    const response = await api.asUser().requestConfluence(route`/wiki/api/v2/pages/${contentId}/properties`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: key,
        value: value
      })
    });
    if (response.ok) {
      console.log(`createContentProperty: Response: ${response.status} ${response.statusText}`);
      return await response.json();
    } else {
      await logResponseError('createContentProperty', response);
    }
  }

  export const getContentProperties = async (contentId) => {
    const response = await api.asUser().requestConfluence(route`/wiki/api/v2/pages/${contentId}/properties`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
      console.log(`getContentProperties: Response: ${response.status} ${response.statusText}`);

      const responseJson = await response.json();

      console.log(`getContentProperties: responseJson: ${JSON.stringify(responseJson, null, 2)}`);
      
      return responseJson.results;
    } else {
      await logResponseError('getContentProperties', response);
    }
  }