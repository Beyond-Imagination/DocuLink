import Resolver from "@forge/resolver";
import { storage } from "@forge/api";
import { getNodes, getKeywordGraphs, searchByAPI, getHierarchy, getLabels } from "./api"

const resolver = new Resolver();

resolver.define('getNodes', async (req) => {
    let graphs = await storage.get('nodes');

    if (!graphs) {
        graphs = await getNodes(graphs);
        await storage.set('nodes', graphs);
    }

    return graphs;
});

resolver.define('getKeywordGraphs', async (req) => {
    let graphs = await storage.get('keyword');

    if (!graphs) {
        graphs = await getKeywordGraphs()
        await storage.set('keyword', graphs);
    }

    return graphs;
});

resolver.define('searchByAPI', async (req) => {
    const { searchWord } = req.payload;
    const result = await searchByAPI(searchWord);
    return result;
});

resolver.define('getHierarchy', async (req) => {
    let graphs = await storage.get('hierarchy');

    if (!graphs) {
        graphs = await getHierarchy()
        await storage.set('hierarchy', graphs);
    }

    return graphs;
})

resolver.define('getLabels', async (req) => {
    let labels = await storage.get('labels');

    if (!labels) {
        labels = await getLabels();
        await storage.set('labels', labels);
    }

    return labels;
});

resolver.define('sync', async (req) => {
    const [nodes, keyword, hierarchy, labels] = await Promise.all([getNodes(), getKeywordGraphs(), getHierarchy(), getLabels()]);
    await Promise.all([storage.set('nodes', nodes), storage.set('keyword', keyword), storage.set('hierarchy', hierarchy), storage.set('labels', labels)])

    return {
        nodes,
        keyword,
        hierarchy,
        labels,
    }
});

export const handler = resolver.getDefinitions();

