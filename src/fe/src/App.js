import './App.css';

import React, { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';

import DarkmodeBtn from "./components/DarkmodeBtn";
import GraphContainer from "./components/GraphContainer";
import GraphControls from "./components/GraphControls";
import LoadingScreen from "./components/LoadingScreen";
import Modal from "./components/Modal";
import SearchBar from "./components/SearchBar";
import SyncConfirmModal from './components/SyncConfirmModal';
import SyncDescription from './components/SyncDescription';
import useGraphData from "./hooks/useGraphData";
import { getLinkColor } from './utils/utils';

function App() {
  const [appWidth, setAppWidth] = useState(window.innerWidth);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [linkColor, setLinkColor] = useState({ keyword: getLinkColor('keyword'), hierarchy: getLinkColor('hierarchy'), labels: getLinkColor('labels'), rovo: getLinkColor('rovo')});
  const [checkbox, setCheckbox] = useState({keyword: false, hierarchy: false, labels: false, rovo: false});
  const [searchWord, setSearchWord] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showRovoModal, setShowRovoModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [isDarkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('doculinkDarkmode') === 'true';
  });
  const { nodes, setNodes, keyword, setKeyword, hierarchy, setHierarchy, label, setLabel, rovo, setRovo } = useGraphData();

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const searchedPageIdList = await invoke('searchByAPI', { searchWord });
      let newNodes = []
      for (const node of nodes) {
        node.searched = searchedPageIdList.includes(node.id);
        newNodes.push(node);
      }
      setNodes(newNodes);
    } finally {
      setIsSearching(false);
    }
  };
  const handleSearchReset = () => {
    let newNodes = []
    for (const node of nodes) {
      node.searched = false;
      newNodes.push(node);
    }
    setNodes(newNodes);
  };
  useEffect(() => {
    let graph = {
      nodes: nodes,
      links: [],
    };

    if (checkbox.keyword) {
      graph.links.push(...keyword);
    }
    if (checkbox.hierarchy) {
      graph.links.push(...hierarchy);
    }
    if (checkbox.labels) {
      graph.links.push(...label);
    }

    if (checkbox.rovo) {
      if (!rovo) {
        setShowRovoModal(true);
      } else {
        graph.links.push(...rovo);
      }
    }
    setGraphData(graph);
  }, [nodes, checkbox]);

  useEffect(() => {
    const handleResize = () => {
      setAppWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSyncConfirm = async () => {
    setShowSyncModal(false);
    setIsSearching(true);
    try {
      const result = await invoke('sync');
      setNodes(result.nodes);
      setKeyword(result.keyword);
      setHierarchy(result.hierarchy);
      setLabel(result.labels);
      
      // Reset the links and checkboxes
      setGraphData({ nodes: result.nodes, links: [] });
      setCheckbox({
        keyword: false,
        hierarchy: false,
        labels: false,
        rovo: false
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
      <div>
        <div>
          <div>
            <div className='absolute z-10 right-[1rem] top-[1rem]'>
              <SearchBar
                  searchWord={searchWord}
                  setSearchWord={setSearchWord}
                  handleSearch={handleSearch}
                  handleSearchReset={handleSearchReset}
              />
            </div>
            <GraphControls
                is3D={is3D}
                setIs3D={setIs3D}
                checkbox={checkbox}
                handleCheckbox={(key, checked) => setCheckbox(prev => ({ ...prev, [key]: checked }))}
                linkColor={linkColor}
                handleLinkColor={(key, color) => setLinkColor(prev => ({ ...prev, [key]: color }))}
                handleSync={() => setShowSyncModal(true)}
            />
          </div>
          <LoadingScreen isVisible={isSearching} />
          <GraphContainer
            is3D={is3D}
            graphData={graphData}
            appWidth={appWidth}
            isDarkMode={isDarkMode}
            linkColor={linkColor}
          />
        </div>
        <SyncDescription />
        <Modal
            content="It is necessary to extract keywords using Rovo's Keyword Extractor Agent. A refresh will be required once the extraction is complete."
            showModal={showRovoModal}
            setShowModal={setShowRovoModal}
        />
        <SyncConfirmModal
          isOpen={showSyncModal}
          onClose={() => setShowSyncModal(false)}
          onConfirm={handleSyncConfirm}
        />
        <DarkmodeBtn isDarkMode = { isDarkMode } onChange = { setDarkMode } />
      </div>
  );
}

export default App;
