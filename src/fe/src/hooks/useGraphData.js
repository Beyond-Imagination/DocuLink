import { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";

async function loadData(fetchFn, setState, setLoading) {
    if (setLoading) setLoading(true);
    try {
        const result = await fetchFn();
        setState(result);
    } finally {
        if (setLoading) setLoading(false);
    }
}

function useGraphData(setIsSearching) {
    const [nodes, setNodes] = useState([]);
    const [keyword, setKeyword] = useState([]);
    const [hierarchy, setHierarchy] = useState([]);
    const [label, setLabel] = useState([]);
    const [rovo, setRovo] = useState([]);

    // fetching node
    useEffect(() => {
        loadData(() => invoke('getNodes'), setNodes, setIsSearching);
    }, []);

    // fetching keyword link
    useEffect(() => {
        loadData(() => invoke('getKeywordGraphs'), setKeyword, undefined);
    }, []);

    // fetching hierarchy link
    useEffect(() => {
        loadData(() => invoke('getHierarchy'), setHierarchy, undefined);
    }, []);

    // fetching label link
    useEffect(() => {
        loadData(() => invoke('getLabels'), setLabel, undefined);
    }, []);

    useEffect(() => {
        loadData(() => invoke('getRovoKeywords'), setRovo, undefined);
    }, []);

    return { nodes, setNodes, keyword, setKeyword, hierarchy, setHierarchy, label, setLabel, rovo, setRovo };
}

export default useGraphData;
