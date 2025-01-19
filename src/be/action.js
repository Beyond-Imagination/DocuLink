import { fetchPageInfos } from './api';
import { storage } from "@forge/api";
import { getKeywordGraphs } from './keywordUtil'

export const fetchConfluencePages = async (payload) => {
    console.log(`fetchConfluencePages: payload = ${JSON.stringify(payload, null, 2)}`);
    const pageInfos = await fetchPageInfos();
    return pageInfos;
}
  
export const registerKeywords = async (payload) => {
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

export const registerRelationships = async (payload) => {
    console.log(`registerRelationships. payload = ${JSON.stringify(payload, null, 2)}`);

    try {
        const links = JSON.parse(payload.links);

        if (!Array.isArray(links)) {
            throw new Error("Links should be an array.");
        }

        for (const link of links) {
            if (typeof link.source !== 'string' || typeof link.target !== 'string' || link.type !== 'rovo') {
                throw new Error(`Invalid link format: ${JSON.stringify(link)}`);
            }
        }

        await storage.set('rovo', links);
    } catch(error) {
        console.error('Error in registerRelationships:', error);
    }
}
