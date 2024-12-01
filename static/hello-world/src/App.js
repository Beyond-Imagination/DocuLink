import React, { useEffect, useState } from 'react';
import './App.css';
import { invoke, router } from '@forge/bridge';
import ForceGraph3D from 'react-force-graph-3d';
import ForceGraph2D from 'react-force-graph-2d';
import SpriteText from 'three-spritetext';
import randomColor from 'randomcolor';
import Search from './components/search';
import SwitchButton from "./components/SwitchButton";

function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [is3D, setIs3D] = useState(false)

  useEffect(async () => {
    const result = await invoke('getGraphs');

    console.log(result)

    setGraphData(result)
  }, []);

  const [searchWord, setSearchWord] = useState('');

  const handleSearch = async () => {
    let nodes = graphData.nodes;

    for(const node of nodes) {
      if(node.keywords.includes(searchWord)) {
        node.searched = true;
      } else {
        node.searched = false;
      }
    }
    setGraphData({
      nodes: nodes,
      links: graphData.links,
    })
  };

  const handleSearchReset = async () => {
    let nodes = graphData.nodes;
    for(const node of nodes) {
      node.searched = false;
    }
    setGraphData({
      nodes: nodes,
      links: graphData.links,
    })
  };
  
  return (
    <div>
      <div className='relative'>
        <Search
          searchWord={searchWord}
          setSearchWord={setSearchWord}
          handleSearch={handleSearch}
          handleSearchReset={handleSearchReset}
        />
        <SwitchButton
            is3D={is3D}
            setIs3D={setIs3D}
        />
          { is3D ?
              <ForceGraph3D
                  graphData={graphData}
                  width={1500}
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
              /> :
              <ForceGraph2D
                  graphData={graphData}
                  width={1500}
                  height={800}
                  linkColor={() => 'rgba(255,255,255,0.8)'}
                  backgroundColor={'rgba(0,0,16,255)'}
                  nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.title;
                    const fontSize = 12/globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => 2*n); // some padding

                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

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
              />
          }
      </div>
    </div>
  );
}

export default App;
