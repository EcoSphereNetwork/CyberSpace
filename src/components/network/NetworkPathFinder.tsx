import React, { useState, useCallback, useEffect } from 'react';
import styled from '@emotion/styled';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { NetworkNode, NetworkLink } from '@/types/network';

const Container = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
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

const NodeSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid ${props => props.theme.colors.divider};
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.action.hover};
  }
`;

const NodeInfo = styled.div`
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

const PathInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: ${props => props.theme.colors.background.default};
  border-radius: 4px;
`;

const PathNode = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 20px;
    top: 28px;
    bottom: -28px;
    width: 2px;
    background: ${props => props.theme.colors.divider};
  }
`;

interface NetworkPathFinderProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  onPathChange: (path: NetworkNode[]) => void;
}

export const NetworkPathFinder: React.FC<NetworkPathFinderProps> = ({
  nodes,
  links,
  onPathChange,
}) => {
  const [sourceNode, setSourceNode] = useState<NetworkNode | null>(null);
  const [targetNode, setTargetNode] = useState<NetworkNode | null>(null);
  const [path, setPath] = useState<NetworkNode[]>([]);
  const [isSelectingSource, setIsSelectingSource] = useState(false);
  const [isSelectingTarget, setIsSelectingTarget] = useState(false);

  // Build adjacency list for path finding
  const adjacencyList = useCallback(() => {
    const list = new Map<string, Set<string>>();
    
    links.forEach(link => {
      const source = link.source as NetworkNode;
      const target = link.target as NetworkNode;
      
      if (!list.has(source.id)) {
        list.set(source.id, new Set());
      }
      if (!list.has(target.id)) {
        list.set(target.id, new Set());
      }
      
      list.get(source.id)!.add(target.id);
      list.get(target.id)!.add(source.id);
    });
    
    return list;
  }, [links]);

  // Find shortest path using BFS
  const findShortestPath = useCallback((source: NetworkNode, target: NetworkNode) => {
    const adj = adjacencyList();
    const queue: NetworkNode[] = [source];
    const visited = new Set<string>([source.id]);
    const parent = new Map<string, NetworkNode>();
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current.id === target.id) {
        // Reconstruct path
        const path: NetworkNode[] = [current];
        let parentNode = parent.get(current.id);
        
        while (parentNode) {
          path.unshift(parentNode);
          parentNode = parent.get(parentNode.id);
        }
        
        return path;
      }
      
      const neighbors = adj.get(current.id) || new Set();
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          const neighbor = nodes.find(n => n.id === neighborId)!;
          visited.add(neighborId);
          parent.set(neighborId, current);
          queue.push(neighbor);
        }
      }
    }
    
    return null;
  }, [nodes, adjacencyList]);

  // Update path when source or target changes
  useEffect(() => {
    if (sourceNode && targetNode) {
      const newPath = findShortestPath(sourceNode, targetNode);
      if (newPath) {
        setPath(newPath);
        onPathChange(newPath);
      } else {
        setPath([]);
        onPathChange([]);
      }
    } else {
      setPath([]);
      onPathChange([]);
    }
  }, [sourceNode, targetNode, findShortestPath, onPathChange]);

  const handleNodeClick = useCallback((node: NetworkNode) => {
    if (isSelectingSource) {
      setSourceNode(node);
      setIsSelectingSource(false);
    } else if (isSelectingTarget) {
      setTargetNode(node);
      setIsSelectingTarget(false);
    }
  }, [isSelectingSource, isSelectingTarget]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isSelectingSource || isSelectingTarget) {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-node]')) {
          setIsSelectingSource(false);
          setIsSelectingTarget(false);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [isSelectingSource, isSelectingTarget]);

  return (
    <Container>
      <h3 style={{ margin: '0 0 8px' }}>Find Path</h3>
      <NodeSelector
        onClick={() => {
          setIsSelectingSource(true);
          setIsSelectingTarget(false);
        }}
      >
        {sourceNode ? (
          <NodeInfo>
            <h4>{sourceNode.label || sourceNode.id}</h4>
            <p>{sourceNode.type}</p>
          </NodeInfo>
        ) : (
          <NodeInfo>
            <h4>Select Source Node</h4>
            <p>Click to select</p>
          </NodeInfo>
        )}
        <IconButton size="small">
          <Icon name={isSelectingSource ? 'close' : 'edit'} />
        </IconButton>
      </NodeSelector>
      <NodeSelector
        onClick={() => {
          setIsSelectingSource(false);
          setIsSelectingTarget(true);
        }}
      >
        {targetNode ? (
          <NodeInfo>
            <h4>{targetNode.label || targetNode.id}</h4>
            <p>{targetNode.type}</p>
          </NodeInfo>
        ) : (
          <NodeInfo>
            <h4>Select Target Node</h4>
            <p>Click to select</p>
          </NodeInfo>
        )}
        <IconButton size="small">
          <Icon name={isSelectingTarget ? 'close' : 'edit'} />
        </IconButton>
      </NodeSelector>
      {path.length > 0 && (
        <PathInfo>
          <div style={{ marginBottom: 8 }}>
            Path Length: {path.length - 1} hop{path.length > 2 ? 's' : ''}
          </div>
          {path.map((node, index) => (
            <PathNode key={node.id}>
              <Icon name={
                node.type === 'cluster' ? 'hub' :
                node.type === 'server' ? 'dns' :
                node.type === 'client' ? 'computer' :
                'device_hub'
              } />
              <NodeInfo>
                <h4>{node.label || node.id}</h4>
                <p>{node.type}</p>
              </NodeInfo>
              {index < path.length - 1 && (
                <Icon name="arrow_downward" style={{ marginLeft: 'auto' }} />
              )}
            </PathNode>
          ))}
        </PathInfo>
      )}
      {sourceNode && targetNode && !path.length && (
        <div style={{ color: 'red', textAlign: 'center', padding: 8 }}>
          No path found between selected nodes
        </div>
      )}
    </Container>
  );
};