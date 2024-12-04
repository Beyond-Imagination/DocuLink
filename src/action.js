import { fetchPageInfos} from './confluenceUtil';

// This routine is a Rovo action that will fetch the content of the page or blog post that the AI is 
// running against.
export const fetchContents = async (payload) => {
    console.log(`fetchContents: payload = ${JSON.stringify(payload, null, 2)}`);
    const pageInfos = await fetchPageInfos();
    return pageInfos;
  }
  
  export const registerKeyword= async (payload) => {
    console.log(`registerKeyword. payload = ${JSON.stringify(payload, null, 2)}`);
    const keyword = sanitise(payload.keyword);
    const resourceType = payload.context.confluence.resourceType;
    await storeKeyword(payload.contentId, resourceType, keyword);
    return JSON.stringify(keyword);
  }

  const sanitise = (text) => {
    return text;
  }
  