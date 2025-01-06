import { fetchPageInfos} from './api';
import {storage } from "@forge/api";
import {getKeywordGraphs} from './keywordUtil'

export const fetchConfluencePages = async (payload) => {
    console.log(`fetchConfluencePages: payload = ${JSON.stringify(payload, null, 2)}`);
    const pageInfos = await fetchPageInfos();
    return pageInfos;
  }
  
  export const registerKeywords= async (payload) => {
    console.log(`registerKeywords. payload = ${JSON.stringify(payload, null, 2)}`);
    
    const documents = JSON.parse(payload.documents);
    console.log(`documents = ${documents}`);
 
    try {
        const rovo = await getKeywordGraphs(documents);
        await storage.set('rovo', rovo);
    } catch (error) {
        console.error('Error in registerKeywords:', error);
    }
  }
