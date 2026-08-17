import api, { route, storage } from "@forge/api";
import { convert } from "adf-to-md";
import { retext } from "retext";
import retextPos from "retext-pos";
import retextKeywords from "retext-keywords";

import { digest } from "./digest";

const KEYWORDS_PER_PAGE = 5;
const NODES_KEY = 'nodes';
const KEYWORD_KEY = 'keyword';
const LABELS_KEY = 'labels';
const META_KEY = 'meta:digest';
const LEGACY_HIERARCHY_KEY = 'hierarchy';
const SCHEMA_VERSION = 3;

const PERSISTED_KEYS = [NODES_KEY, KEYWORD_KEY, LABELS_KEY];

const asJson = async (url) => {
    const response = await api.asApp().requestConfluence(url, {
        headers: {
            'Accept': 'application/json'
        }
    });

    return response.json();
};

const nextCursor = (result) => {
    if (!result._links?.next) {
        return null;
    }

    return new URLSearchParams(result._links.next.split('?')[1]).get('cursor');
};

const pagesUrl = (cursor) => cursor
    ? route`/wiki/api/v2/pages?body-format=atlas_doc_format&limit=100&cursor=${cursor}`
    : route`/wiki/api/v2/pages?body-format=atlas_doc_format&limit=100`;

const labelsUrl = (cursor) => cursor
    ? route`/wiki/api/v2/labels?limit=100&cursor=${cursor}`
    : route`/wiki/api/v2/labels?limit=100`;

const toMembership = (map) => {
    const membership = {};

    for (const key of [...map.keys()].sort()) {
        const ids = [...new Set(map.get(key))].sort();

        if (ids.length > 1) {
            membership[key] = ids;
        }
    }

    return membership;
};

const resolveAuthorName = async (accountId, cache) => {
    if (!accountId) {
        return null;
    }

    if (!cache.has(accountId)) {
        const result = await asJson(route`/wiki/rest/api/user?accountId=${accountId}`);
        cache.set(accountId, result.displayName ?? null);
    }

    return cache.get(accountId);
};

const collectKeywords = async (page, keywordMap) => {
    const adf = page.body?.atlas_doc_format?.value;

    if (!adf) {
        return;
    }

    const doc = convert(JSON.parse(adf));
    const body = doc.result.replace(/(\r\n|\n|\r)/gm, "");

    const file = await retext()
        .use(retextPos) // Make sure to use `retext-pos` before `retext-keywords`.
        .use(retextKeywords)
        .process(body);

    const keywords = [...(file.data.keywords ?? [])]
        .sort((a, b) => b.score - a.score || b.matches.length - a.matches.length)
        .slice(0, KEYWORDS_PER_PAGE);

    for (const { stem } of keywords) {
        const ids = keywordMap.get(stem);

        if (ids) {
            ids.push(page.id);
        } else {
            keywordMap.set(stem, [page.id]);
        }
    }
};

const buildPageGraph = async () => {
    const systemInfo = await asJson(route`/wiki/rest/api/settings/systemInfo`);
    const baseUrl = systemInfo.baseUrl;

    const nodes = [];
    const authorNames = new Map();
    const keywordMap = new Map();
    let cursor = null;

    while (true) {
        const result = await asJson(pagesUrl(cursor));

        for (const page of result.results) {
            try {
                nodes.push({
                    id: page.id,
                    title: page.title,
                    searched: false,
                    url: baseUrl + page._links.webui,
                    authorName: await resolveAuthorName(page.authorId, authorNames),
                    status: page.status,
                    createdAt: page.createdAt,
                    parentId: page.parentId ?? null,
                });

                await collectKeywords(page, keywordMap);
            } catch (e) {
                console.log(e)
            }
        }

        console.log('buildPageGraph document count', nodes.length)

        cursor = nextCursor(result);
        if (!cursor) {
            break
        }
    }

    nodes.sort((a, b) => a.id.localeCompare(b.id));

    return { nodes, keyword: toMembership(keywordMap) };
};

const buildLabelMembership = async () => {
    const labelMap = new Map();
    let cursor = null;
    let count = 0

    while (true) {
        const result = await asJson(labelsUrl(cursor));

        if (!result.results?.length) {
            break
        }

        count += result.results.length
        console.log('buildLabelMembership label count', count)

        const labeled = await Promise.all(result.results.map(async (label) => ({
            name: label.name,
            pages: (await asJson(route`/wiki/api/v2/labels/${label.id}/pages`)).results ?? [],
        })));

        for (const { name, pages } of labeled) {
            const ids = labelMap.get(name) ?? [];
            ids.push(...pages.map((page) => page.id));
            labelMap.set(name, ids);
        }

        cursor = nextCursor(result);
        if (!cursor) {
            break
        }
    }

    return toMembership(labelMap);
};

const persist = async (graph) => {
    const meta = await storage.get(META_KEY) ?? {};
    const migrating = meta.schema !== SCHEMA_VERSION;
    const next = { schema: SCHEMA_VERSION };
    const writes = [];

    for (const key of PERSISTED_KEYS) {
        next[key] = digest(graph[key]);

        if (migrating || meta[key] !== next[key]) {
            writes.push(storage.set(key, graph[key]));
        }
    }

    if (migrating) {
        writes.push(storage.delete(LEGACY_HIERARCHY_KEY));
    }

    if (writes.length === 0) {
        console.log('graph unchanged, skipped all writes');
        return;
    }

    writes.push(storage.set(META_KEY, next));
    await Promise.all(writes);
    console.log(`graph persisted, wrote ${writes.length} keys`);
};

export const rebuildGraph = async () => {
    const [pageGraph, labels] = await Promise.all([buildPageGraph(), buildLabelMembership()]);
    const graph = { nodes: pageGraph.nodes, keyword: pageGraph.keyword, labels };

    await persist(graph);

    return graph;
};

export const readGraph = async () => {
    const [meta, nodes, keyword, labels] = await Promise.all([
        storage.get(META_KEY),
        storage.get(NODES_KEY),
        storage.get(KEYWORD_KEY),
        storage.get(LABELS_KEY),
    ]);

    if (!nodes || meta?.schema !== SCHEMA_VERSION) {
        return rebuildGraph();
    }

    return { nodes, keyword: keyword ?? {}, labels: labels ?? {} };
};
