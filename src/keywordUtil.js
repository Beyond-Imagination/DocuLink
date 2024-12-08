import { getDocumentInfo } from './confluenceUtil';
import { storage } from '@forge/api';

let keywordMap = new Map(); 
const links = [];

export const storeKeyword = async (contentId, keywords) => {
  try {
    const { title, url } = await getDocumentInfo(contentId);

    const document = {
      id: contentId,
      title,
      keywords,
      searched: false,
      url,
    };

    await processDocument(document);
  } catch (error) {
    console.error(`Error in storeKeyword: ${error.message}`);
  }
}

const processDocument = async (d) => {
  try {
    const nodes = (await storage.get('nodes')) || [];
    const links = (await storage.get('links')) || [];
    const keywordMapObj = (await storage.get('keywordMap')) || {};
    let keywordMap = new Map(Object.entries(keywordMapObj));

    const existingDoc = docs.find(doc => doc.id === d.id);
    if (!existingDoc) {
      docs.push(d);
    }

    for (const word of d.keywords) {
      let docIds = keywordMap.get(word) || [];

      for (const id of docIds) {

        const linkExists = links.some(
          (link) =>
            (link.source === id && link.target === d.id) ||
            (link.source === d.id && link.target === id)
        );
        if (!linkExists) {
          links.push({ source: id, target: d.id });
        }
      }

      docIds.push(d.id);
      keywordMap.set(word, docIds);
    }

    await storage.set('nodes', nodes);
    await storage.set('links', links);
    await storage.set('keywordMap', Object.fromEntries(keywordMap));

  } catch (error) {
    console.error(`Error in processDocument: ${error.message}`);
    throw error;
  }
}

export const retrieveData = async () => {
  try {
    const nodes = (await storage.get('nodes')) || [];
    const links = (await storage.get('links')) || [];

    return { nodes, links };
  } catch (error) {
    console.error(`Error in retrieveData: ${error.message}`);
    throw error;
  }
};