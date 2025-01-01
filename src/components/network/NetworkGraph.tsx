import React, { useRef, useMemo, useState, useCallback, useEffect } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { ForceGraph2D } from "react-force-graph";
import * as d3 from "d3";
import { useResizeObserver } from "@/hooks/useResizeObserver";
import { NetworkTooltip } from "./NetworkTooltip";
import { NetworkControls } from "./NetworkControls";
import { NetworkContextMenu } from "./NetworkContextMenu";
import { NetworkNode, NetworkLink, NetworkCluster } from "@/types/network";

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

export interface NetworkGraphProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  clusters?: NetworkCluster[];
  onNodeClick?: (node: NetworkNode) => void;
  onNodeDoubleClick?: (node: NetworkNode) => void;
  onNodeContextMenu?: (node: NetworkNode, event: React.MouseEvent) => void;
  onLinkClick?: (link: NetworkLink) => void;
  onNodeHover?: (node: NetworkNode | null) => void;
  onLinkHover?: (link: NetworkLink | null) => void;
  onBackgroundClick?: () => void;
  onNodesChange?: (nodes: NetworkNode[]) => void;
  onLinksChange?: (links: NetworkLink[]) => void;
  onClustersChange?: (clusters: NetworkCluster[]) => void;
  selectedNode?: NetworkNode;
  highlightedPath?: NetworkNode[];
  layout?: 'force' | 'radial' | 'hierarchical';
  showParticles?: boolean;
  showSearch?: boolean;
  showPathFinder?: boolean;
  showGrouping?: boolean;
  showExport?: boolean;
  searchPlaceholder?: string;
  pathFinderTitle?: string;
  groupingTitle?: string;
  exportTitle?: string;
  maxSearchResults?: number;
  maxPathLength?: number;
  minGroupSize?: number;
  maxGroupSize?: number;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  nodes,
  links,
  clusters = [],
  onNodeClick,
  onNodeDoubleClick,
  onNodeContextMenu,
  onLinkClick,
  onNodeHover,
  onLinkHover,
  onBackgroundClick,
  onNodesChange,
  onLinksChange,
  onClustersChange,
  selectedNode,
  highlightedPath,
  layout = 'force',
  showParticles = true,
  showSearch = true,
  showPathFinder = true,
  showGrouping = true,
  showExport = true,
  searchPlaceholder = 'Search nodes...',
  pathFinderTitle = 'Find Path',
  groupingTitle = 'Group Nodes',
  exportTitle = 'Export/Import',
  maxSearchResults = 50,
  maxPathLength = 10,
  minGroupSize = 2,
  maxGroupSize = 20,
}) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const size = useResizeObserver(containerRef.current);

  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [hoveredLink, setHoveredLink] = useState<NetworkLink | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<{
    node: NetworkNode;
    x: number;
    y: number;
  } | null>(null);

  // Process nodes and links with visual attributes
  const graphData = useMemo(() => {
    // Group nodes by cluster
    const nodesByCluster = nodes.reduce((acc, node) => {
      if (node.clusterId) {
        acc[node.clusterId] = acc[node.clusterId] || [];
        acc[node.clusterId].push(node);
      }
      return acc;
    }, {} as Record<string, NetworkNode[]>);

    // Calculate cluster positions and add cluster nodes
    const clusterNodes = clusters.map(cluster => {
      const clusterNodes = nodesByCluster[cluster.id] || [];
      const x = clusterNodes.reduce((sum, n) => sum + (n.x || 0), 0) / (clusterNodes.length || 1);
      const y = clusterNodes.reduce((sum, n) => sum + (n.y || 0), 0) / (clusterNodes.length || 1);
      return {
        ...cluster,
        x,
        y,
        type: 'cluster',
        size: cluster.radius || 100,
        color: cluster.color || theme.colors.primary.main + '40',
      };
    });

    return {
      nodes: [
        ...nodes.map(node => ({
          ...node,
          color: node.color || theme.colors.primary.main,
          size: node.size || 8,
          highlighted: highlightedPath?.includes(node),
          selected: node === selectedNode,
        })),
        ...clusterNodes,
      ],
      links: links.map(link => ({
        ...link,
        color: link.color || theme.colors.divider,
        width: link.width || 1,
        highlighted: 
          highlightedPath?.includes(link.source as NetworkNode) &&
          highlightedPath?.includes(link.target as NetworkNode),
      })),
    };
  }, [nodes, links, clusters, theme, highlightedPath, selectedNode]);

  // Apply layout
  useEffect(() => {
    if (!graphRef.current || !size) return;

    const { d3Force } = graphRef.current;
    
    switch (layout) {
      case 'radial':
        d3Force('charge')?.strength(-100);
        d3Force('link')?.distance(50);
        d3Force('radial', d3.forceRadial(
          200,
          size.width / 2,
          size.height / 2
        ));
        break;
        
      case 'hierarchical':
        d3Force('charge')?.strength(-300);
        d3Force('link')?.distance(100);
        d3Force('y', d3.forceY(node => {
          const level = (node as NetworkNode).level || 0;
          return 100 + level * 100;
        }).strength(1));
        break;
        
      default: // force
        d3Force('charge')?.strength(-100);
        d3Force('link')?.distance(50);
        d3Force('center', d3.forceCenter(
          size.width / 2,
          size.height / 2
        ));
        d3Force('radial', null);
        d3Force('y', null);
    }

    // Add clustering force
    if (clusters.length > 0) {
      d3Force('cluster', alpha => {
        const nodes = graphData.nodes.filter(n => n.type !== 'cluster');
        nodes.forEach(node => {
          if (!node.clusterId) return;
          const cluster = clusters.find(c => c.id === node.clusterId);
          if (!cluster) return;

          const k = alpha * 0.7;
          const x = node.x || 0;
          const y = node.y || 0;
          node.vx = (node.vx || 0) + (cluster.x - x) * k;
          node.vy = (node.vy || 0) + (cluster.y - y) * k;
        });
      });
    }

    graphRef.current.d3ReheatSimulation();
  }, [graphData, layout, size, clusters]);

  const handleNodeHover = useCallback((node: NetworkNode | null, event: MouseEvent) => {
    setHoveredNode(node);
    if (node) {
      setTooltipPosition({
        x: event.clientX,
        y: event.clientY,
      });
    }
    onNodeHover?.(node);
  }, [onNodeHover]);

  const handleLinkHover = useCallback((link: NetworkLink | null, event: MouseEvent) => {
    setHoveredLink(link);
    if (link) {
      setTooltipPosition({
        x: event.clientX,
        y: event.clientY,
      });
    }
    onLinkHover?.(link);
  }, [onLinkHover]);

  const handleNodeClick = useCallback((node: NetworkNode, event: MouseEvent) => {
    onNodeClick?.(node);
    setContextMenu(null);
  }, [onNodeClick]);

  const handleNodeRightClick = useCallback((node: NetworkNode, event: MouseEvent) => {
    event.preventDefault();
    if (onNodeContextMenu && event instanceof MouseEvent) {
      onNodeContextMenu(node, event as unknown as React.MouseEvent);
      setContextMenu({ node, x: event.clientX, y: event.clientY });
    }
  }, [onNodeContextMenu]);

  const handleBackgroundClick = useCallback(() => {
    onBackgroundClick?.();
    setContextMenu(null);
  }, [onBackgroundClick]);

  return (
    <Container ref={containerRef}>
      {size && (
        <>
          <ForceGraph2D
            ref={graphRef}
            width={size.width}
            height={size.height}
            graphData={graphData}
            nodeLabel="label"
            linkLabel="label"
            nodeColor={node => 
              node.highlighted ? theme.colors.primary.main :
              node.selected ? theme.colors.secondary.main :
              node.color
            }
            linkColor={link => 
              link.highlighted ? theme.colors.primary.main :
              link.color
            }
            linkWidth={link => 
              link.highlighted ? 2 :
              link.width
            }
            nodeRelSize={1}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const size = node.size as number;
              const x = node.x as number;
              const y = node.y as number;
              
              ctx.beginPath();
              ctx.arc(x, y, size, 0, 2 * Math.PI);
              
              // Add glow effect for highlighted/selected nodes
              if (node.highlighted || node.selected) {
                ctx.shadowColor = node.highlighted ? 
                  theme.colors.primary.main :
                  theme.colors.secondary.main;
                ctx.shadowBlur = 10;
              }
              
              ctx.fillStyle = node.color as string;
              ctx.fill();
              
              // Reset shadow
              ctx.shadowColor = 'transparent';
              ctx.shadowBlur = 0;
              
              // Draw label if zoomed in
              if (globalScale > 1) {
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = theme.colors.text.primary;
                ctx.fillText(node.label || '', x, y + size + 5);
              }
              
              // Draw status indicator
              if (node.status) {
                ctx.beginPath();
                ctx.arc(x + size, y - size, 3, 0, 2 * Math.PI);
                ctx.fillStyle = 
                  node.status === 'active' ? theme.colors.success.main :
                  node.status === 'warning' ? theme.colors.warning.main :
                  node.colors.error.main;
                ctx.fill();
              }
            }}
            linkDirectionalParticles={showParticles ? 4 : 0}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={0.005}
            linkDirectionalParticleColor={link => 
              link.highlighted ? theme.colors.primary.main :
              theme.colors.primary.light
            }
            onNodeClick={handleNodeClick}
            onNodeRightClick={handleNodeRightClick}
            onNodeDragEnd={(node) => {
              node.fx = node.x;
              node.fy = node.y;
              onNodesChange?.(nodes);
            }}
            onBackgroundClick={handleBackgroundClick}
            onNodeHover={handleNodeHover}
            onLinkHover={handleLinkHover}
            cooldownTicks={100}
            onEngineStop={() => {
              graphRef.current?.zoomToFit(400, 50);
            }}
          />
          <NetworkControls
            onZoomIn={() => graphRef.current?.zoom(1.2)}
            onZoomOut={() => graphRef.current?.zoom(1 / 1.2)}
            onReset={() => {
              graphRef.current?.zoomToFit(400);
              graphRef.current?.d3ReheatSimulation();
            }}
            onToggleLayout={() => {
              const layouts = ['force', 'radial', 'hierarchical'];
              const currentIndex = layouts.indexOf(layout);
              const nextLayout = layouts[(currentIndex + 1) % layouts.length];
              // TODO: Add layout change callback
            }}
          />
          {showSearch && (
            <NetworkSearch
              nodes={nodes}
              links={links}
              onNodeSelect={onNodeClick!}
              onFilterChange={filters => {
                // TODO: Implement filtering logic
              }}
              selectedNode={selectedNode}
            />
          )}
          {showPathFinder && (
            <NetworkPathFinder
              nodes={nodes}
              links={links}
              onPathChange={path => {
                // Update highlighted path
                if (path.length > 0 && path.length <= maxPathLength) {
                  onNodesChange?.(nodes.map(node => ({
                    ...node,
                    highlighted: path.includes(node),
                  })));
                }
              }}
            />
          )}
          {showGrouping && (
            <NetworkGrouping
              nodes={nodes}
              links={links}
              clusters={clusters}
              onUpdateClusters={newClusters => {
                if (onClustersChange) {
                  // Validate group sizes
                  const validClusters = newClusters.filter(cluster => {
                    const size = cluster.nodes.length;
                    return size >= minGroupSize && size <= maxGroupSize;
                  });
                  onClustersChange(validClusters);
                }
              }}
            />
          )}
          {showExport && (
            <NetworkExport
              nodes={nodes}
              links={links}
              clusters={clusters}
              onImport={data => {
                onNodesChange?.(data.nodes);
                onLinksChange?.(data.links);
                onClustersChange?.(data.clusters || []);
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
          {contextMenu && (
            <NetworkContextMenu
              node={contextMenu.node}
              x={contextMenu.x}
              y={contextMenu.y}
              onClose={() => setContextMenu(null)}
            />
          )}
        </>
      )}
    </Container>
  );
};
