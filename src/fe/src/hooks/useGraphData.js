import { invoke } from '@forge/bridge';
import { useEffect, useMemo, useState } from 'react';

import { expandHierarchy, expandMembership } from '../utils/utils';

const EMPTY_GRAPH = { nodes: [], keyword: {}, labels: {} };

const useGraphData = (setIsSearching) => {
  const [graph, setGraph] = useState(EMPTY_GRAPH);
  const [rovo, setRovo] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (setIsSearching) setIsSearching(true);
      try {
        const [nextGraph, nextRovo] = await Promise.all([invoke('getGraph'), invoke('getRovoKeywords')]);
        if (!cancelled) {
          setGraph(nextGraph);
          setRovo(nextRovo);
        }
      } finally {
        if (!cancelled && setIsSearching) setIsSearching(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const keyword = useMemo(() => expandMembership(graph.keyword, 'keyword'), [graph.keyword]);
  const labels = useMemo(() => expandMembership(graph.labels, 'labels'), [graph.labels]);
  const hierarchy = useMemo(() => expandHierarchy(graph.nodes), [graph.nodes]);

  const setNodes = (nodes) => setGraph((prev) => ({ ...prev, nodes }));

  return { nodes: graph.nodes, setNodes, keyword, hierarchy, labels, rovo, setGraph };
};

export default useGraphData;
