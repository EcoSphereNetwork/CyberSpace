import React, { useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { NetworkGraph } from '@/components/network/NetworkGraph';
import { NetworkNode, NetworkLink, NetworkCluster } from '@/types/network';

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: ${props => props.theme.colors.background.default};
  display: flex;
  flex-direction: column;
`;

const GraphContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
`;

interface NetworkViewProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  clusters?: NetworkCluster[];
  selectedNode?: NetworkNode | null;
  highlightedPath?: NetworkNode[];
  onNodeClick?: (node: NetworkNode) => void;
  onNodeDoubleClick?: (node: NetworkNode) => void;
  onNodeContextMenu?: (node: NetworkNode, event: React.MouseEvent) => void;
  onNodesChange?: (nodes: NetworkNode[]) => void;
  onLinksChange?: (links: NetworkLink[]) => void;
  onClustersChange?: (clusters: NetworkCluster[]) => void;
  showSearch?: boolean;
  showPathFinder?: boolean;
  showGrouping?: boolean;
  showExport?: boolean;
}

export const NetworkView: React.FC<NetworkViewProps> = ({
  nodes,
  links,
  clusters = [],
  selectedNode,
  highlightedPath = [],
  onNodeClick,
  onNodeDoubleClick,
  onNodeContextMenu,
  onNodesChange,
  onLinksChange,
  onClustersChange,
  showSearch = true,
  showPathFinder = true,
  showGrouping = true,
  showExport = true,
}) => {
  // Local state for internal handling if no external handlers provided
  const [localSelectedNode, setLocalSelectedNode] = useState<NetworkNode | null>(null);
  const [localHighlightedPath, setLocalHighlightedPath] = useState<NetworkNode[]>([]);

  const handleNodeClick = useCallback((node: NetworkNode) => {
    if (onNodeClick) {
      onNodeClick(node);
    } else {
      setLocalSelectedNode(node === localSelectedNode ? null : node);
      setLocalHighlightedPath([]);
    }
  }, [onNodeClick, localSelectedNode]);

  const handleNodeDoubleClick = useCallback((node: NetworkNode) => {
    if (onNodeDoubleClick) {
      onNodeDoubleClick(node);
    } else {
      const effectiveSelectedNode = selectedNode || localSelectedNode;
      if (effectiveSelectedNode && effectiveSelectedNode !== node) {
        // Simple path for demo - replace with actual path finding
        const path = [effectiveSelectedNode, node];
        if (onNodesChange) {
          onNodesChange(nodes.map(n => ({
            ...n,
            highlighted: path.includes(n),
          })));
        } else {
          setLocalHighlightedPath(path);
        }
      }
    }
  }, [onNodeDoubleClick, selectedNode, localSelectedNode, onNodesChange, nodes]);

  return (
    <Container>
      <GraphContainer>
        <NetworkGraph
          nodes={nodes}
          links={links}
          clusters={clusters}
          selectedNode={selectedNode || localSelectedNode}
          highlightedPath={highlightedPath || localHighlightedPath}
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={handleNodeDoubleClick}
          onNodeContextMenu={onNodeContextMenu}
          onNodesChange={onNodesChange}
          onLinksChange={onLinksChange}
          onClustersChange={onClustersChange}
          showSearch={showSearch}
          showPathFinder={showPathFinder}
          showGrouping={showGrouping}
          showExport={showExport}
        />
      </GraphContainer>
    </Container>
  );
};
