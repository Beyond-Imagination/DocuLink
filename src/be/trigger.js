import { storage } from "@forge/api";
import { getNodes, getKeywordGraphs, getHierarchy, getLabels } from "./api"

export const keywordTrigger = async ({ context }) => {
    console.log('Scheduled trigger invoked');

    await storage.set('keyword', await getKeywordGraphs());
};

export const nodesTrigger = async ({ context }) => {
    await storage.set('nodes', await getNodes());
};

export const hierarchyTrigger = async ({ context }) => {
    await storage.set('hierarchy', await getHierarchy());
};

export const labelsTrigger = async ({ context }) => {
    await storage.set('labels', await getLabels());
};
