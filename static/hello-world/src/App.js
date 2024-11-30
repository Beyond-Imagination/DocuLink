import React, { useEffect, useState } from 'react';
import './App.css';
import { invoke, router } from '@forge/bridge';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import randomColor from 'randomcolor';
import Search from './components/search';

function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

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
  
  return (
    <div>
      <Search
        searchWord={searchWord}
        setSearchWord={setSearchWord}
        handleSearch={handleSearch}
      />
      <ForceGraph3D
          graphData={graphData}
          width={1500}
          height={800}
          linkOpacity={0.8}
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
      />
    </div>
  );
}

export default App;
