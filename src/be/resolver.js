import Resolver from "@forge/resolver";
import api, { route, storage } from "@forge/api";
import { convert } from "adf-to-md";
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

export const handler = resolver.getDefinitions();
