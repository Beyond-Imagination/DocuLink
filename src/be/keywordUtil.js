import { getDocumentInfo } from './api';

export const getKeywordGraphs = async (documents) => {

  const links = [];
  const docs = []

  let keywordMap = new Map()

  for (const document of documents) {
    // console.log(`document = ${JSON.stringify(document, null, 2)}`);
    try {
      const { title, url, status, authorName, createdAt } = await getDocumentInfo(document.id);

      const keywords = []
      if (document.keywords) {
        for (const keyword of document.keywords) {
          const docIds = keywordMap.get(keyword)
          if (docIds) {
            keywordMap.set(keyword, [...docIds, document.id])
            docIds.forEach(id => {
              links.push({
                source: id,
                target: document.id,
                type: 'keyword',
              })
            })
          } else {
            keywordMap.set(keyword, [document.id])
          }
          keywords.push(keyword)
        }
      }
      docs.push({
        id: document.id,
        title,
        keywords: document.keywords,
        searched: false,
        url,
        status,
        authorName,
        createdAt
      })
    } catch (error) {
      console.log(error)
    }
  }
  return links
  
}
