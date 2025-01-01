import React, { useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { NetworkGraph } from '@/components/network/NetworkGraph';
import { NetworkNode, NetworkLink, NetworkCluster } from '@/types/network';

const Container = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  background: ${props => props.theme.colors.background.default};
`;

export const NetworkView: React.FC = () => {
  // Sample data - replace with actual data source
  const [nodes] = useState<NetworkNode[]>([
    { id: '1', label: 'Node 1', x: 0, y: 0, type: 'server', status: 'active' },
    { id: '2', label: 'Node 2', x: 100, y: 0, type: 'client', status: 'warning' },
    { id: '3', label: 'Node 3', x: 0, y: 100, type: 'server', status: 'error' },
    { id: '4', label: 'Node 4', x: 100, y: 100, type: 'client', status: 'active' },
  ]);

  const [links] = useState<NetworkLink[]>([
    { source: '1', target: '2', id: 'link1', type: 'connection' },
    { source: '2', target: '3', id: 'link2', type: 'connection' },
    { source: '3', target: '4', id: 'link3', type: 'connection' },
    { source: '4', target: '1', id: 'link4', type: 'connection' },
  ]);

  const [clusters] = useState<NetworkCluster[]>([
    {
      id: 'cluster1',
      label: 'Server Cluster',
      nodes: ['1', '3'],
      x: 0,
      y: 50,
      radius: 80,
      color: '#4CAF50',
    },
    {
      id: 'cluster2',
      label: 'Client Cluster',
      nodes: ['2', '4'],
      x: 100,
      y: 50,
      radius: 80,
      color: '#2196F3',
    },
  ]);

  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<NetworkNode[]>([]);

  const handleNodeClick = useCallback((node: NetworkNode) => {
    setSelectedNode(node === selectedNode ? null : node);
    setHighlightedPath([]);
  }, [selectedNode]);

  const handleNodeDoubleClick = useCallback((node: NetworkNode) => {
    // Find path from selected node to double-clicked node
    if (selectedNode && selectedNode !== node) {
      // Simple path for demo - replace with actual path finding
      setHighlightedPath([selectedNode, node]);
    }
  }, [selectedNode]);

  return (
    <Container>
      <NetworkGraph
        nodes={nodes}
        links={links}
        clusters={clusters}
        selectedNode={selectedNode}
        highlightedPath={highlightedPath}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        showSearch
        showPathFinder
        showGrouping
        showExport
      />
    </Container>
  );
};
