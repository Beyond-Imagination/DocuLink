import Resolver from "@forge/resolver";
import { storage } from "@forge/api";
import { searchByAPI } from "./api"
import { readGraph, rebuildGraph } from "./graph"

const resolver = new Resolver();

resolver.define('getGraph', async (req) => {
    return await readGraph();
});

resolver.define('getRovoKeywords', async (req) => {
    return await storage.get('rovo') ?? [];
});

resolver.define('searchByAPI', async (req) => {
    const { searchWord } = req.payload;
    const result = await searchByAPI(searchWord);
    return result;
});

resolver.define('sync', async (req) => {
    return await rebuildGraph();
});

export const handler = resolver.getDefinitions();
