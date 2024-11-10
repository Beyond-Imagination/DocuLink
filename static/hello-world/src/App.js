import React, { useEffect, useState } from 'react';

import { invoke } from '@forge/bridge';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import randomColor from 'randomcolor';

function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(async () => {
    const result = await invoke('getGraphs');

    console.log(result)

    setGraphData(result)
  }, []);

  return (
    <div>
      <ForceGraph3D
          graphData={graphData}
          width={1500}
          height={800}
          linkOpacity={0.8}
          controlType={'orbit'}
          nodeThreeObject={node => {
            const sprite = new SpriteText(node.title);
            sprite.color = randomColor()
            sprite.textHeight = 8;
            return sprite;
          }}
      />
    </div>
  );
}

export default App;
