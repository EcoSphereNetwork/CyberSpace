import React, { useRef, useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { ForceGraph2D } from "react-force-graph";
import { useResizeObserver } from "@/hooks/useResizeObserver";
import { NetworkTooltip } from "./NetworkTooltip";
import { NetworkNode, NetworkLink } from "@/types/network";

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

export interface NetworkGraphProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  onNodeClick?: (node: NetworkNode) => void;
  onLinkClick?: (link: NetworkLink) => void;
  onNodeHover?: (node: NetworkNode | null) => void;
  onLinkHover?: (link: NetworkLink | null) => void;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  nodes,
  links,
  onNodeClick,
  onLinkClick,
  onNodeHover,
  onLinkHover,
}) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useResizeObserver(containerRef.current);

  const graphData = useMemo(() => ({
    nodes: nodes.map(node => ({
      ...node,
      color: node.color || theme.colors.primary.main,
      size: node.size || 8,
    })),
    links: links.map(link => ({
      ...link,
      color: link.color || theme.colors.divider,
      width: link.width || 1,
    })),
  }), [nodes, links, theme]);

  const [hoveredNode, setHoveredNode] = React.useState<NetworkNode | null>(null);
  const [hoveredLink, setHoveredLink] = React.useState<NetworkLink | null>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });

  const handleNodeHover = (node: NetworkNode | null, event: MouseEvent) => {
    setHoveredNode(node);
    if (node) {
      setTooltipPosition({
        x: event.clientX,
        y: event.clientY,
      });
    }
    onNodeHover?.(node);
  };

  const handleLinkHover = (link: NetworkLink | null, event: MouseEvent) => {
    setHoveredLink(link);
    if (link) {
      setTooltipPosition({
        x: event.clientX,
        y: event.clientY,
      });
    }
    onLinkHover?.(link);
  };

  return (
    <Container ref={containerRef}>
      {size && (
        <ForceGraph2D
          width={size.width}
          height={size.height}
          graphData={graphData}
          nodeLabel="label"
          linkLabel="label"
          nodeColor="color"
          linkColor="color"
          linkWidth="width"
          nodeRelSize={1}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleColor={() => theme.colors.primary.main}
          onNodeClick={(node) => onNodeClick?.(node as NetworkNode)}
          onLinkClick={(link) => onLinkClick?.(link as NetworkLink)}
          onNodeHover={(node) => onNodeHover?.(node as NetworkNode)}
          onLinkHover={(link) => onLinkHover?.(link as NetworkLink)}
          onNodeDragEnd={(node) => {
            node.fx = node.x;
            node.fy = node.y;
          }}
        />
      )}
      {(hoveredNode || hoveredLink) && (
        <NetworkTooltip
          x={tooltipPosition.x}
          y={tooltipPosition.y}
          item={hoveredNode || hoveredLink!}
        />
      )}
    </Container>
  );
};
