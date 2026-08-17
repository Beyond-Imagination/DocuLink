import { rebuildGraph } from "./graph"

export const graphTrigger = async ({ context }) => {
    console.log('Scheduled trigger invoked');

    await rebuildGraph();
};
