import { fetchPageInfos} from './confluenceUtil';
import {storeKeyword} from './keywordUtil'

export const fetchContents = async (payload) => {
    console.log(`fetchContents: payload = ${JSON.stringify(payload, null, 2)}`);
    const pageInfos = await fetchPageInfos();
    return pageInfos;
  }
  
  export const registerKeywords= async (payload) => {
    console.log(`registerKeywords. payload = ${JSON.stringify(payload, null, 2)}`);
    const keywords = sanitise(payload.keywords);
    await storeKeyword(payload.contentId, keywords);
    return JSON.stringify(keywords);
  }

  const sanitise = (text) => {
    return text;
  }
  