import { getDocumentInfo } from './confluenceUtil';
import { storage } from '@forge/api';

let keywordMap = new Map(); 
const links = [];

export const storeKeyword = async (contentId, keywords) => {
  try {
    // Confluence에서 문서 정보 가져오기
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
    // 스토리지에서 기존 데이터 가져오기
    const docs = (await storage.get('docs')) || [];
    const links = (await storage.get('links')) || [];
    const keywordMapObj = (await storage.get('keywordMap')) || {};
    let keywordMap = new Map(Object.entries(keywordMapObj));

    // 이미 저장된 문서인지 확인
    const existingDoc = docs.find(doc => doc.id === d.id);
    if (!existingDoc) {
      docs.push(d);
    }

    // 각 키워드에 대해 keywordMap과 links 업데이트
    for (const word of d.keywords) {
      let docIds = keywordMap.get(word) || [];

      // 기존 문서 ID 각각에 대해 링크 생성
      for (const id of docIds) {
        // 중복 링크 방지
        const linkExists = links.some(
          (link) =>
            (link.source === id && link.target === d.id) ||
            (link.source === d.id && link.target === id)
        );
        if (!linkExists) {
          links.push({ source: id, target: d.id });
        }
      }

      // 현재 문서 ID를 추가하여 keywordMap 업데이트
      docIds.push(d.id);
      keywordMap.set(word, docIds);
    }

    // 변경된 데이터 스토리지에 저장
    await storage.set('docs', docs);
    await storage.set('links', links);
    await storage.set('keywordMap', Object.fromEntries(keywordMap));

  } catch (error) {
    console.error(`Error in processDocument: ${error.message}`);
    throw error;
  }
}

export const retrieveData = async () => {
  try {
    const docs = (await storage.get('docs')) || [];
    const links = (await storage.get('links')) || [];

    return { docs, links };
  } catch (error) {
    console.error(`Error in retrieveData: ${error.message}`);
    throw error;
  }
};