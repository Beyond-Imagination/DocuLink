import { updateContentProperty, createContentProperty, getContentProperties } from './confluenceUtil';

const propertKeyPrefix = 'keyword';

export const storeKeyword = async (contentId, keyword) => {
      const key = propertKeyPrefix;
      const value = JSON.stringify({ keywords: keywords});
      const contentProperties = await getContentProperties(contentId);

      console.log(`storeKeyword: contentProperties = ${JSON.stringify(contentProperties, null, 2)}`);

      const existingContentProperty = await findContentProperty(contentProperties);
      if (existingContentProperty) {
        // Just in case the answer has changed...
        await updateContentProperty(contentId, existingContentProperty.id, key, value, existingContentProperty.version.number + 1);
      } else {
        await createContentProperty(contentId, key, value);
      }
  }

export const retrieveKeyword = async (contentId) => {
    const contentProperties = await getContentProperties(contentId);

    console.log(`retrieveKeyword: contentProperties = ${JSON.stringify(contentProperties, null, 2)}`);

    for (const contentProperty of contentProperties) {
      if (contentProperty.key.startsWith(propertKeyPrefix)) {
        const value = JSON.parse(contentProperty.value);
      }
    }
    return value.keyword;
  }

  const findContentProperty = (contentProperties) => {
    for (const contentProperty of contentProperties) {
      if (contentProperty.key.startsWith(propertKeyPrefix)) {
          return contentProperty
      }
    }
    return undefined;
  }

  export const logResponseError = async (functionName, response) => {
    console.error(`${functionName}: Error: ${response.status} ${response.statusText}: ${await response.text()}`);
  }