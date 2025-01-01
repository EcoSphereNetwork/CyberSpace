import React, { useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { NetworkNode, NetworkLink, NetworkCluster } from '@/types/network';

const Container = styled.div`
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 320px;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 8px;
  box-shadow: ${props => props.theme.shadows[2]};
  padding: 16px;
`;

const GroupingMethod = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid ${props => props.theme.colors.divider};
  border-radius: 4px;
  background: ${props => props.$active ? props.theme.colors.primary.main : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.primary.contrastText : props.theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary.dark : props.theme.colors.action.hover};
  }
`;

const GroupList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 300px;
  overflow-y: auto;
`;

const GroupItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: ${props => props.theme.colors.background.default};
  border-radius: 4px;
`;

const GroupInfo = styled.div`
  flex: 1;
  min-width: 0;

  h4 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 500;
  }

  p {
    margin: 0;
    font-size: 0.75rem;
    color: ${props => props.theme.colors.text.secondary};
  }
`;

interface NetworkGroupingProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  clusters: NetworkCluster[];
  onUpdateClusters: (clusters: NetworkCluster[]) => void;
}

type GroupingMethod = 'type' | 'status' | 'connectivity' | 'custom';

export const NetworkGrouping: React.FC<NetworkGroupingProps> = ({
  nodes,
  links,
  clusters,
  onUpdateClusters,
}) => {
  const [activeMethod, setActiveMethod] = useState<GroupingMethod>('type');
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());

  const groupByType = useCallback(() => {
    const groups = new Map<string, NetworkNode[]>();
    
    nodes.forEach(node => {
      if (!node.type) return;
      if (!groups.has(node.type)) {
        groups.set(node.type, []);
      }
      groups.get(node.type)!.push(node);
    });

    const newClusters: NetworkCluster[] = Array.from(groups.entries()).map(([type, nodes]) => {
      const x = nodes.reduce((sum, n) => sum + (n.x || 0), 0) / nodes.length;
      const y = nodes.reduce((sum, n) => sum + (n.y || 0), 0) / nodes.length;
      
      return {
        id: `cluster-${type}`,
        label: `${type} Cluster`,
        type: 'cluster',
        x,
        y,
        radius: Math.sqrt(nodes.length) * 50,
        color: nodes[0].color,
        nodes: nodes.map(n => n.id),
      };
    });

    onUpdateClusters(newClusters);
  }, [nodes, onUpdateClusters]);

  const groupByStatus = useCallback(() => {
    const groups = new Map<string, NetworkNode[]>();
    
    nodes.forEach(node => {
      if (!node.status) return;
      if (!groups.has(node.status)) {
        groups.set(node.status, []);
      }
      groups.get(node.status)!.push(node);
    });

    const newClusters: NetworkCluster[] = Array.from(groups.entries()).map(([status, nodes]) => {
      const x = nodes.reduce((sum, n) => sum + (n.x || 0), 0) / nodes.length;
      const y = nodes.reduce((sum, n) => sum + (n.y || 0), 0) / nodes.length;
      
      return {
        id: `cluster-${status}`,
        label: `${status} Nodes`,
        type: 'cluster',
        x,
        y,
        radius: Math.sqrt(nodes.length) * 50,
        color: 
          status === 'active' ? '#4caf50' :
          status === 'warning' ? '#ff9800' :
          status === 'error' ? '#f44336' :
          '#9e9e9e',
        nodes: nodes.map(n => n.id),
      };
    });

    onUpdateClusters(newClusters);
  }, [nodes, onUpdateClusters]);

  const groupByConnectivity = useCallback(() => {
    // Build adjacency list
    const adj = new Map<string, Set<string>>();
    links.forEach(link => {
      const source = link.source as NetworkNode;
      const target = link.target as NetworkNode;
      
      if (!adj.has(source.id)) {
        adj.set(source.id, new Set());
      }
      if (!adj.has(target.id)) {
        adj.set(target.id, new Set());
      }
      
      adj.get(source.id)!.add(target.id);
      adj.get(target.id)!.add(source.id);
    });

    // Find connected components using DFS
    const visited = new Set<string>();
    const components: NetworkNode[][] = [];

    const dfs = (nodeId: string, component: NetworkNode[]) => {
      visited.add(nodeId);
      const node = nodes.find(n => n.id === nodeId)!;
      component.push(node);

      const neighbors = adj.get(nodeId) || new Set();
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          dfs(neighborId, component);
        }
      }
    };

    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        const component: NetworkNode[] = [];
        dfs(node.id, component);
        components.push(component);
      }
    });

    const newClusters: NetworkCluster[] = components.map((nodes, i) => {
      const x = nodes.reduce((sum, n) => sum + (n.x || 0), 0) / nodes.length;
      const y = nodes.reduce((sum, n) => sum + (n.y || 0), 0) / nodes.length;
      
      return {
        id: `cluster-${i}`,
        label: `Component ${i + 1}`,
        type: 'cluster',
        x,
        y,
        radius: Math.sqrt(nodes.length) * 50,
        color: nodes[0].color,
        nodes: nodes.map(n => n.id),
      };
    });

    onUpdateClusters(newClusters);
  }, [nodes, links, onUpdateClusters]);

  const createCustomGroup = useCallback(() => {
    if (selectedNodes.size < 2) return;

    const groupNodes = nodes.filter(n => selectedNodes.has(n.id));
    const x = groupNodes.reduce((sum, n) => sum + (n.x || 0), 0) / groupNodes.length;
    const y = groupNodes.reduce((sum, n) => sum + (n.y || 0), 0) / groupNodes.length;

    const newCluster: NetworkCluster = {
      id: `cluster-${Date.now()}`,
      label: `Custom Group`,
      type: 'cluster',
      x,
      y,
      radius: Math.sqrt(groupNodes.length) * 50,
      color: groupNodes[0].color,
      nodes: groupNodes.map(n => n.id),
    };

    onUpdateClusters([...clusters, newCluster]);
    setSelectedNodes(new Set());
  }, [nodes, clusters, selectedNodes, onUpdateClusters]);

  const handleMethodChange = useCallback((method: GroupingMethod) => {
    setActiveMethod(method);
    setSelectedNodes(new Set());

    switch (method) {
      case 'type':
        groupByType();
        break;
      case 'status':
        groupByStatus();
        break;
      case 'connectivity':
        groupByConnectivity();
        break;
      case 'custom':
        onUpdateClusters([]);
        break;
    }
  }, [groupByType, groupByStatus, groupByConnectivity, onUpdateClusters]);

  const toggleNodeSelection = useCallback((nodeId: string) => {
    setSelectedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  return (
    <Container>
      <h3 style={{ margin: '0 0 8px' }}>Group Nodes</h3>
      <div style={{ display: 'flex', gap: 8 }}>
        <GroupingMethod
          $active={activeMethod === 'type'}
          onClick={() => handleMethodChange('type')}
        >
          <Icon name="category" />
          By Type
        </GroupingMethod>
        <GroupingMethod
          $active={activeMethod === 'status'}
          onClick={() => handleMethodChange('status')}
        >
          <Icon name="info" />
          By Status
        </GroupingMethod>
        <GroupingMethod
          $active={activeMethod === 'connectivity'}
          onClick={() => handleMethodChange('connectivity')}
        >
          <Icon name="hub" />
          By Connectivity
        </GroupingMethod>
        <GroupingMethod
          $active={activeMethod === 'custom'}
          onClick={() => handleMethodChange('custom')}
        >
          <Icon name="edit" />
          Custom
        </GroupingMethod>
      </div>
      {activeMethod === 'custom' ? (
        <>
          <p style={{ margin: '8px 0', fontSize: '0.875rem' }}>
            Select nodes to group together
          </p>
          <GroupList>
            {nodes.map(node => (
              <GroupItem
                key={node.id}
                style={{
                  background: selectedNodes.has(node.id)
                    ? 'rgba(25, 118, 210, 0.1)'
                    : undefined,
                }}
                onClick={() => toggleNodeSelection(node.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedNodes.has(node.id)}
                  onChange={() => toggleNodeSelection(node.id)}
                />
                <GroupInfo>
                  <h4>{node.label || node.id}</h4>
                  <p>{node.type}</p>
                </GroupInfo>
              </GroupItem>
            ))}
          </GroupList>
          <IconButton
            onClick={createCustomGroup}
            disabled={selectedNodes.size < 2}
            style={{ marginTop: 8 }}
          >
            <Icon name="group_work" />
            Create Group
          </IconButton>
        </>
      ) : (
        <GroupList>
          {clusters.map(cluster => (
            <GroupItem key={cluster.id}>
              <Icon name="folder" style={{ color: cluster.color }} />
              <GroupInfo>
                <h4>{cluster.label}</h4>
                <p>{cluster.nodes.length} nodes</p>
              </GroupInfo>
              <IconButton
                size="small"
                onClick={() => {
                  onUpdateClusters(clusters.filter(c => c.id !== cluster.id));
                }}
              >
                <Icon name="close" />
              </IconButton>
            </GroupItem>
          ))}
        </GroupList>
      )}
    </Container>
  );
};