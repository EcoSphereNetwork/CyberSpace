import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { NetworkView } from "@/views/NetworkView";
import { NetworkToolbar } from "@/components/network/NetworkToolbar";
import { NetworkSidebar } from "@/components/network/NetworkSidebar";
import { NetworkLegend } from "@/components/network/NetworkLegend";
import { NetworkNode, NetworkLink, NetworkCluster } from "@/types/network";

const Container = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background.default};
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
`;

const Main = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const NetworkContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  border: 1px solid ${props => props.theme.colors.divider};
  border-radius: 4px;
  margin: 8px;
  background: ${props => props.theme.colors.background.paper};
`;

interface NetworkSceneProps {
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const NetworkScene: React.FC<NetworkSceneProps> = ({
  onLoad,
  onError,
}) => {
  const theme = useTheme();

  // Network data state
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [links, setLinks] = useState<NetworkLink[]>([]);
  const [clusters, setClusters] = useState<NetworkCluster[]>([]);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<NetworkNode[]>([]);

  // UI state
  const [activeLayer, setActiveLayer] = useState("default");
  const [filters, setFilters] = useState({
    activeNodes: true,
    criticalPaths: true,
    warnings: true,
    errors: true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Sample data - replace with actual API call
        const sampleNodes: NetworkNode[] = [
          { id: '1', label: 'Node 1', x: 0, y: 0, type: 'server', status: 'active' },
          { id: '2', label: 'Node 2', x: 100, y: 0, type: 'client', status: 'warning' },
          { id: '3', label: 'Node 3', x: 0, y: 100, type: 'server', status: 'error' },
          { id: '4', label: 'Node 4', x: 100, y: 100, type: 'client', status: 'active' },
        ];

        const sampleLinks: NetworkLink[] = [
          { source: '1', target: '2', id: 'link1', type: 'connection' },
          { source: '2', target: '3', id: 'link2', type: 'connection' },
          { source: '3', target: '4', id: 'link3', type: 'connection' },
          { source: '4', target: '1', id: 'link4', type: 'connection' },
        ];

        const sampleClusters: NetworkCluster[] = [
          {
            id: 'cluster1',
            label: 'Server Cluster',
            nodes: ['1', '3'],
            x: 0,
            y: 50,
            radius: 80,
            color: theme.colors.success.main,
          },
          {
            id: 'cluster2',
            label: 'Client Cluster',
            nodes: ['2', '4'],
            x: 100,
            y: 50,
            radius: 80,
            color: theme.colors.info.main,
          },
        ];

        setNodes(sampleNodes);
        setLinks(sampleLinks);
        setClusters(sampleClusters);
        onLoad?.();
      } catch (error) {
        console.error('Failed to load network data:', error);
        onError?.(error instanceof Error ? error : new Error('Failed to load network data'));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [theme, onLoad, onError]);

  // Handle node selection
  const handleNodeClick = useCallback((node: NetworkNode) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node);
    setHighlightedPath([]);
  }, []);

  // Handle node path finding
  const handleNodeDoubleClick = useCallback((node: NetworkNode) => {
    if (selectedNode && selectedNode.id !== node.id) {
      // Simple path for demo - replace with actual path finding
      setHighlightedPath([selectedNode, node]);
    }
  }, [selectedNode]);

  // Handle layer changes
  const handleLayerChange = useCallback((layer: string) => {
    setActiveLayer(layer);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Record<string, boolean>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  // Handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Filter nodes based on current filters and search
  const filteredNodes = nodes.filter(node => {
    const matchesSearch = !searchTerm || 
      node.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = 
      (filters.activeNodes && node.status === 'active') ||
      (filters.warnings && node.status === 'warning') ||
      (filters.errors && node.status === 'error');

    return matchesSearch && matchesFilters;
  });

  // Filter links based on filtered nodes
  const filteredLinks = links.filter(link => {
    const sourceNode = filteredNodes.find(n => n.id === link.source);
    const targetNode = filteredNodes.find(n => n.id === link.target);
    return sourceNode && targetNode;
  });

  return (
    <Container>
      <NetworkToolbar
        activeLayer={activeLayer}
        onLayerChange={handleLayerChange}
        onHelp={() => console.log('Help requested')}
      />
      <Content>
        <NetworkSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />
        <Main>
          <NetworkContainer>
            <NetworkView
              nodes={filteredNodes}
              links={filteredLinks}
              clusters={clusters}
              selectedNode={selectedNode}
              highlightedPath={highlightedPath}
              onNodeClick={handleNodeClick}
              onNodeDoubleClick={handleNodeDoubleClick}
              onNodesChange={nodes => {
                setNodes(nodes);
                setHighlightedPath(nodes.filter(n => n.highlighted));
              }}
              onLinksChange={setLinks}
              onClustersChange={setClusters}
              showSearch={false} // We use our own search in the sidebar
              showPathFinder
              showGrouping
              showExport
            />
          </NetworkContainer>
        </Main>
        <NetworkLegend
          data={{
            nodes: filteredNodes,
            links: filteredLinks,
            filters,
            search: searchTerm,
          }}
        />
      </Content>
    </Container>
  );
};
