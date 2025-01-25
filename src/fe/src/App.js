import React, { useEffect, useState } from 'react';
import './App.css';
import { invoke, router } from '@forge/bridge';
import ForceGraph3D from 'react-force-graph-3d';
import ForceGraph2D from 'react-force-graph-2d';
import SpriteText from 'three-spritetext';
import SearchBar from './components/SearchBar';
import SwitchButton from "./components/SwitchButton";
import CheckBox from "./components/Checkbox";
import { getLinkColor } from './utils/utils';
import PageNodeTooltip from './components/PageNodeTooltip';
import SyncBtn from './components/SyncBtn';
import SyncDescription from './components/SyncDescription';
import Modal from "./components/Modal";

function App() {
  const [appWidth, setAppWidth] = useState(window.innerWidth);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [checkbox, setCheckbox] = useState({keyword: false, hierarchy: false, labels: false, rovo: false});
  const [nodes, setNodes] = useState([]);
  const [keyword, setKeyword] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [labels, setLabels] = useState([]);
  const [rovos, setRovos] = useState([]);
  const [is3D, setIs3D] = useState(false)
  const [isSearching, setIsSearching] = useState(false);
  const [searchWord, setSearchWord] = useState('');
  const [tooltipContent, setTooltipContent] = useState(null);
  const [showRovoModal, setShowRovoModal] = useState(false);

  useEffect(async () => {
    setIsSearching(true);
    try{
      const result = await invoke('getNodes');
      console.log('nodes',result);
      setNodes(result)
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(async () => {
    const result = await invoke('getKeywordGraphs');
    setKeyword(result)
  }, []);

  useEffect(async () => {
    const result = await invoke('getHierarchy');
    setHierarchy(result)
  }, []);

  useEffect(async () => {
    try{
      const result = await invoke('getLabels');
      setLabels(result)
    } finally {
    }
  }, []);

  useEffect(async () => {
    try {
      const result = await invoke('getRovoKeywords');
      setRovos(result)
    } finally {
    }
  }, []);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const searchedPageIdList = await invoke('searchByAPI', { searchWord });
      let newNodes = []
      for(const node of nodes.nodes) {
        node.searched = searchedPageIdList.includes(node.id);
        newNodes.push(node);
      }
      setNodes(newNodes);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchReset = async () => {
    let newNodes = []
    for(const node of nodes.nodes) {
      node.searched = false;
      newNodes.push(node);
    }
    setNodes(newNodes);
  };

  // checkbox example event
  const handleCheckbox = (key, checked) => {
    let newCheckbox = {...checkbox};
    if(key === "keyword") {
      newCheckbox.keyword = checked;
    } else if(key === "page hierarchy") {
      newCheckbox.hierarchy = checked;
    } else if (key === "labels") {
      newCheckbox.labels = checked;
    } else if (key === "rovo") {
      newCheckbox.rovo = checked;
    }

    setCheckbox(newCheckbox);
  };

  useEffect(() => {
    let graph = {
      nodes: nodes.nodes,
      links: [],
    }

    if (checkbox.keyword) {
      graph.links.push(...keyword);
    }
    if (checkbox.hierarchy) {
      graph.links.push(...hierarchy);
    }
    if (checkbox.labels) {
      graph.links.push(...labels);
    }

    if (checkbox.rovo) {
      if (!rovos) {
        setShowRovoModal(true);
      } else {
        graph.links.push(...rovos);
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

  const handleSync = async () => {
    setIsSearching(true);
    try {
      const result = await invoke('sync');
      setNodes(result.nodes)
      setKeyword(result.keyword)
      setHierarchy(result.hierarchy)
      setLabels(result.labels)
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
            <div className='absolute z-10 right-[1rem] top-[5rem] space-y-2'>
              <SwitchButton
                  is3D={is3D}
                  setIs3D={setIs3D}
              />
              <CheckBox
                  title='keyword'
                  onChecked={handleCheckbox}
                  tooltip='Connect pages by keyword'
                  color={getLinkColor('keyword')}
              />
              <CheckBox
                  title='rovo'
                  onChecked={handleCheckbox}
                  tooltip='Connect pages by rovo'
                  color={getLinkColor('rovo')}
              />
              <CheckBox
                  title='page hierarchy'
                  onChecked={handleCheckbox}
                  tooltip='Connect pages by page hierarchy'
                  color={getLinkColor('hierarchy')}
              />
              <CheckBox
                  title='labels'
                  onChecked={handleCheckbox}
                  tooltip='Connect pages by page labels'
                  color={getLinkColor('labels')}
              />
            </div>
            <div className='absolute z-10 right-[1rem] top-[16rem]'>
              <SyncBtn handleSync={handleSync}/>
            </div>
          </div>
          {isSearching && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
                <div className="animate-pulse flex flex-col items-center space-y-4">
                  <div className="text-slate-600 text-xl font-medium">DocuLink</div>
                  <div className="flex-1 space-y-6 py-1">
                    <div className="h-2 bg-slate-600 rounded w-24"></div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-2 bg-slate-600 rounded col-span-2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          )}
          {tooltipContent && (
              <PageNodeTooltip
                  title={tooltipContent.title}
                  status={tooltipContent.status}
                  createdAt={tooltipContent.createdAt}
                  authorName={tooltipContent.authorName}
              />
          )
          }
          { is3D ?
              <ForceGraph3D
                  graphData={graphData}
                  width={appWidth}
                  height={800}
                  linkOpacity={0.8}
                  linkColor={link=> {
                    return getLinkColor(link.type)
                  }}
                  // backgroundColor={'black'}
                  controlType={'orbit'}
                  nodeThreeObject={node => {
                    const sprite = new SpriteText(node.title);
                    node.searched ? sprite.textHeight = 30 : sprite.textHeight = 10;
                    node.searched ? sprite.color = '#ffde21' : sprite.color = '#ffffff';
                    return sprite;
                  }}
                  onNodeClick={(node) => {
                    if (node.url) {
                      router.open(node.url);
                    }
                  }}
                  onNodeHover={(node, prevNode) => {
                    if (node) {
                      setTooltipContent({
                        title: node.title,
                        authorName: node.authorName,
                        createdAt: node.createdAt,
                        status: node.status,
                      });
                    } else {
                      setTooltipContent(null);
                    }
                  }}
              /> :
              <ForceGraph2D
                  graphData={graphData}
                  width={appWidth}
                  height={800}
                  linkColor={link=> {
                    return getLinkColor(link.type)
                  }}
                  backgroundColor={'rgba(0,0,16,255)'}
                  nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.title;
                    const fontSize = node.searched ? 24/globalScale : 12/globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => 2*n); // some padding

                    node.searched ? ctx.fillStyle = 'rgba(255, 222, 33, 0.8)' : ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = node.color;
                    ctx.fillText(label, node.x, node.y);

                    node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
                  }}
                  nodePointerAreaPaint={(node, color, ctx) => {
                    ctx.fillStyle = color;
                    const bckgDimensions = node.__bckgDimensions;
                    bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
                  }}
                  onNodeClick={(node) => {
                    if (node.url) {
                      router.open(node.url);
                    }
                  }}
                  onNodeHover={(node, prevNode) => {
                    if (node) {
                      setTooltipContent({
                        title: node.title,
                        authorName: node.authorName,
                        createdAt: node.createdAt,
                        status: node.status,
                      });
                    } else {
                      setTooltipContent(null);
                    }
                  }}
              />
          }
        </div>
        <SyncDescription />
        <Modal
            content="It is necessary to extract keywords using Rovo's Keyword Extractor Agent. A refresh will be required once the extraction is complete."
            showModal={showRovoModal}
            setShowModal={setShowRovoModal}
        />
      </div>
  );
}

export default App;
