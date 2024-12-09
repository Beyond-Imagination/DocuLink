import React, { useEffect, useState } from 'react';
import './App.css';
import { invoke, router } from '@forge/bridge';
import ForceGraph3D from 'react-force-graph-3d';
import ForceGraph2D from 'react-force-graph-2d';
import SpriteText from 'three-spritetext';
import SearchBar from './components/SearchBar';
import SwitchButton from "./components/SwitchButton";
import CheckBox from "./components/Checkbox";

function App() {
  const [appWidth, setAppWidth] = useState(window.innerWidth);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [checkbox, setCheckbox] = useState({keyword: false, hierarchy: false});
  const [nodes, setNodes] = useState({ nodes: [] });
  const [keyword, setKeyword] = useState({ nodes: [], links: [] });
  const [hierarchy, setHierarchy] = useState({ nodes: [], links: [] });
  const [is3D, setIs3D] = useState(false)
  const [isSearching, setIsSearching] = useState(false);
  const [searchWord, setSearchWord] = useState('');
  const [tooltipContent, setTooltipContent] = useState(null);

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
    try{
      const result = await invoke('getHierarchy');

      setHierarchy(result)
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
      const result = {
        nodes : newNodes
      }
      setNodes(result);
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
    const result = {
      nodes : newNodes
    }
    setNodes(result);
  };

  // checkbox example event
  const handleCheckbox = (key, checked) => {
    let newCheckbox = {...checkbox};
    if(key === "keyword") {
      newCheckbox.keyword = checked;
    } else if(key === "page hierarchy") {
      newCheckbox.hierarchy = checked;
    }

    setCheckbox(newCheckbox);
  };

  useEffect(() => {
    let graph = {
      nodes: nodes.nodes,
      links: [],
    }

    if (checkbox.keyword) {
      graph.links.push(...keyword.links);
    }
    if (checkbox.hierarchy) {
      graph.links.push(...hierarchy.links);
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

  return (
    <div>
      <div className={`relative`}>
        <div className='absolute z-10 right-[1rem] top-[1rem]'>
          <SearchBar
            searchWord={searchWord}
            setSearchWord={setSearchWord}
            handleSearch={handleSearch}
            handleSearchReset={handleSearchReset}
          />
          <div className='flex justify-end p-[1rem]'>
            <SwitchButton
              is3D={is3D}
              setIs3D={setIs3D}
            />
          </div>
          <div className='px-[1rem] flex justify-end'>
            <div className='space-y-2'>
              <CheckBox
                title='keyword'
                onChecked={handleCheckbox}
              />
              <CheckBox
                title='page hierarchy'
                onChecked={handleCheckbox}
              />
            </div>
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
            <div 
              className='absolute bottom-0 right-0 bg-black/70 text-yellow-300 p-[1rem] rounded pointer-events-none z-[1000] text-start'
              >
                <div className='text-xl font-bold'>
                  {tooltipContent.title}
                </div>
                <div className='text-base'>
                  <span className='font-semibold'>Status:</span>
                  <span className='text-base'>{tooltipContent.status}</span>
                </div>
                <div className='text-base'>
                  <span className='font-semibold'>Author:</span>
                  <span className='text-base'>{tooltipContent.authorName}</span>
                </div>
                <div className='text-base'>
                  <span className='font-semibold'>Created:</span>
                  <span className='text-base'>{tooltipContent.createdAt}</span>
                </div>
              </div>
            )
          }
          { is3D ?
              <ForceGraph3D
                  graphData={graphData}
                  width={appWidth}
                  height={800}
                  linkOpacity={0.8}
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
                  linkColor={() => 'rgba(255,255,255,0.8)'}
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
    </div>
  );
}

export default App;
