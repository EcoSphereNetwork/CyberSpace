import React, { useRef, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { ForceGraph2D } from "react-force-graph";
import { useResizeObserver } from "@/hooks/useResizeObserver";
import { NetworkNode, NetworkLink, NetworkGraphData } from "./types";
import { NetworkControls } from "./NetworkControls";
import { NetworkLegend } from "./NetworkLegend";
import { NetworkTooltip } from "./NetworkTooltip";

const GraphContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows[1]};
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

interface NetworkGraphProps {
  data: NetworkGraphData;
  onNodeClick?: (node: NetworkNode) => void;
  onLinkClick?: (link: NetworkLink) => void;
  onNodeHover?: (node: NetworkNode | null) => void;
  onLinkHover?: (link: NetworkLink | null) => void;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  data,
  onNodeClick,
  onLinkClick,
  onNodeHover,
  onLinkHover,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const theme = useTheme();
  const { width, height } = useResizeObserver(containerRef);

  // Memoize graph data to prevent unnecessary re-renders
  const graphData = useMemo(() => ({
    nodes: data.nodes.map(node => ({
      ...node,
      color: node.color || theme.colors.primary.main,
      size: node.size || 8,
    })),
    links: data.links.map(link => ({
      ...link,
      color: link.color || theme.colors.text.secondary + "80",
      width: link.width || 1,
    })),
  }), [data, theme]);

  // Graph configuration
  const graphConfig = useMemo(() => ({
    nodeRelSize: 6,
    linkDirectionalParticles: 4,
    linkDirectionalParticleSpeed: 0.01,
    d3Force: {
      charge: {
        strength: -100,
        distanceMax: 200,
      },
      link: {
        distance: 100,
      },
    },
    nodeCanvasObject: (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
      ctx.fillStyle = node.color;
      ctx.fill();

      // Node label
      if (node.label && globalScale >= 1) {
        ctx.font = "4px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = theme.colors.text.primary;
        ctx.fillText(node.label, node.x, node.y + node.size + 4);
      }
    },
    linkCanvasObject: (link: any, ctx: CanvasRenderingContext2D) => {
      // Calculate link position
      const start = link.source;
      const end = link.target;
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const angle = Math.atan2(dy, dx);

      // Draw link line
      ctx.beginPath();
      ctx.strokeStyle = link.color;
      ctx.lineWidth = link.width;
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // Draw arrow if directed
      if (link.directed) {
        const arrowLength = 10;
        const arrowAngle = Math.PI / 6;
        const x = end.x - Math.cos(angle) * (end.size + arrowLength);
        const y = end.y - Math.sin(angle) * (end.size + arrowLength);

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
          x - arrowLength * Math.cos(angle - arrowAngle),
          y - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.lineTo(
          x - arrowLength * Math.cos(angle + arrowAngle),
          y - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.fillStyle = link.color;
        ctx.fill();
      }

      // Draw link label
      if (link.label) {
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        ctx.font = "4px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = theme.colors.text.secondary;
        ctx.fillText(link.label, midX, midY);
      }
    },
  }), [theme]);

  // Handle zoom/pan
  const handleZoom = (zoom: number) => {
    if (graphRef.current) {
      graphRef.current.zoom(zoom);
    }
  };

  const handleCenter = () => {
    if (graphRef.current) {
      graphRef.current.centerAt(0, 0, 1000);
      graphRef.current.zoom(1, 1000);
    }
  };

  return (
    <GraphContainer ref={containerRef}>
      {width && height && (
        <ForceGraph2D
          ref={graphRef}
          width={width}
          height={height}
          graphData={graphData}
          {...graphConfig}
          onNodeClick={(node) => onNodeClick?.(node as NetworkNode)}
          onLinkClick={(link) => onLinkClick?.(link as NetworkLink)}
          onNodeHover={(node) => onNodeHover?.(node as NetworkNode)}
          onLinkHover={(link) => onLinkHover?.(link as NetworkLink)}
        />
      )}
      <NetworkControls
        onZoomIn={() => handleZoom(graphRef.current?.zoom() * 1.2)}
        onZoomOut={() => handleZoom(graphRef.current?.zoom() / 1.2)}
        onCenter={handleCenter}
      />
      <NetworkLegend data={data} />
      <NetworkTooltip />
    </GraphContainer>
  );
};
