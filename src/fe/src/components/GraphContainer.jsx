import { useState } from "react";

import PageNodeTooltip from "./PageNodeTooltip";
import Graph from "./Graph";

function GraphContainer({ is3D, graphData, appWidth, isDarkMode, linkColor }) {
    const [tooltipContent, setTooltipContent] = useState(null);
    const nodeColor = isDarkMode ? '#ffffff' : '#525252';
    const backgroundColor = isDarkMode ? 'black' : 'lightgrey';
    return (
        <>
            <Graph
                is3D={is3D}
                graphData={graphData}
                width={appWidth}
                height={800}
                backgroundColor={backgroundColor}
                linkColor={linkColor}
                nodeColor={nodeColor}
                setTooltipContent={setTooltipContent}
            />
            {tooltipContent && (
                <PageNodeTooltip
                    title={tooltipContent.title}
                    status={tooltipContent.status}
                    createdAt={tooltipContent.createdAt}
                    authorName={tooltipContent.authorName}
                />
            )}
        </>
    )
}

export default GraphContainer;