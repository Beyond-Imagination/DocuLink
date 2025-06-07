import React, { useCallback } from 'react'
import * as THREE from "three";
import { router } from "@forge/bridge";
import ForceGraph3D from "react-force-graph-3d";
import ForceGraph2D from "react-force-graph-2d";

import { getLinkColor } from "../utils/utils";

function Graph({ is3D, graphData, width, height, backgroundColor, linkColor, nodeColor, setTooltipContent }) {
    const resolveLinkColor = useCallback((type) => {
        return linkColor[type] ?? getLinkColor(type);
    }, [linkColor]);

    const handleNodeClick = (node) => {
        if (node.url) {
            router.open(node.url);
        }
    };

    const handleNodeHover = (node) => {
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
    };

    return is3D ? (
        <ForceGraph3D
            graphData={graphData}
            width={width}
            height={height}
            linkOpacity={0.8}
            controlType={'orbit'}
            backgroundColor={backgroundColor}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
            linkColor={(link) => resolveLinkColor(link.type)}
            nodeThreeObject={(node) => {
                const radius = node.searched ? 10 : 8;
                const color = node.searched ? '#ffde21' : nodeColor;
                const geometry = new THREE.SphereGeometry(radius, 16, 16);
                const material = new THREE.MeshBasicMaterial({ color });

                return new THREE.Mesh(geometry, material);
            }}
        />
    ) : (
        <ForceGraph2D
            graphData={graphData}
            width={width}
            height={height}
            backgroundColor={backgroundColor}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
            linkColor={(link) => resolveLinkColor(link.type)}
            nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.title;
                const fontSize = 9 / globalScale;
                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth, fontSize].map(n => 2*n); // some padding'
                const radius = node.searched ? 10 : 8;

                node.searched ? ctx.fillStyle = 'rgba(255, 222, 33, 0.8)' : ctx.fillStyle = nodeColor;

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = node.color;
                ctx.font = `${fontSize * 1.5}px system-ui`;

                ctx.beginPath();
                ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                ctx.fill();

                if (fontSize < 5) {
                    ctx.fillText(label, node.x, node.y + (node.searched ? 15 : 13));
                }

                node.__bckgDimensions = bckgDimensions;
            }}
            nodePointerAreaPaint={(node, color, ctx) => {
                ctx.fillStyle = color;
                const bckgDimensions = node.__bckgDimensions;
                bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
            }}
        />
    );
}

export default Graph;