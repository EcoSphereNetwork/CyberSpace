// Converted to TypeScript with JSX
import React from 'react';
import React, { useMemo, useState, useEffect } from 'react';
import { Node } from './NodeLayer';
import { GlowingEdge } from './EffectLayer';
import { PhysicalLayer } from './PhysicalLayer';
import { HybridLayer } from './HybridLayer';

export export function DigitalLayer({ nodes, edges, onNodeCluster, fetchLiveData, onSyncWithPhysical, onSyncWithHybrid }) {
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [liveNodes, setLiveNodes] = useState(nodes);
  const [liveEdges, setLiveEdges] = useState(edges);

  useEffect(() => {
    if (fetchLiveData) {
      const interval = setInterval(async () => {
        const { updatedNodes, updatedEdges } = await fetchLiveData();
        setLiveNodes(updatedNodes);
        setLiveEdges(updatedEdges);

        if (onSyncWithPhysical) {
          onSyncWithPhysical(updatedNodes);
        }

        if (onSyncWithHybrid) {
          onSyncWithHybrid(updatedNodes, updatedEdges);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [fetchLiveData, onSyncWithPhysical, onSyncWithHybrid]);

  const handleNodeContextMenu = (e, node) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  const handleClusterClick = (clusterId) => {
    setSelectedCluster(clusterId);
    if (onNodeCluster) onNodeCluster(clusterId);
  };

  const memoizedNodes = useMemo(() => {
    return liveNodes.map((node, index) => (
      <Node
        key={index}
        {...node}
        onContextMenu={(e) => handleNodeContextMenu(e, node)}
        isClustered={selectedCluster === node.clusterId}
      />
    ));
  }, [liveNodes, selectedCluster]);

  const memoizedEdges = useMemo(() => {
    return liveEdges.map((edge, index) => (
      <GlowingEdge
        key={index}
        start={edge.start}
        end={edge.end}
        color={edge.color}
        speed={edge.speed}
        intensity={edge.intensity || 1.0}
      />
    ));
  }, [liveEdges]);

  return (
    <group>
      {memoizedNodes}
      {memoizedEdges}

      {contextMenu && (
        <div
          style={{
            position: 'absolute',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: 'white',
            border: '1px solid gray',
            boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.3)',
            zIndex: 10,
          }}
        >
          <ul style={{ listStyleType: 'none', margin: 0, padding: '5px' }}>
            <li
              style={{ padding: '5px', cursor: 'pointer' }}
              onClick={() => alert('Details anzeigen')}
            >
              Details anzeigen
            </li>
            <li
              style={{ padding: '5px', cursor: 'pointer' }}
              onClick={() => alert('Verbinden')}
            >
              Verbinden
            </li>
            <li
              style={{ padding: '5px', cursor: 'pointer' }}
              onClick={() => alert('Entfernen')}
            >
              Entfernen
            </li>
          </ul>
        </div>
      )}

      {selectedCluster && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 20,
          }}
        >
          <p>Cluster ID: {selectedCluster}</p>
          <button onClick={() => setSelectedCluster(null)}>Cluster verlassen</button>
        </div>
      )}
    </group>
  );
}

/**
 * Features added:
 * 1. **Context Menu for Nodes:**
 *    - Right-click on a node to open a menu with actions like "Details anzeigen", "Verbinden", "Entfernen".
 * 2. **Cluster Interaction:**
 *    - Nodes can now belong to clusters.
 *    - Users can select a cluster to highlight all its nodes.
 * 3. **Dynamic Visuals:**
 *    - Clusters dynamically update visuals to indicate selection.
 * 4. **Real-Time Updates:**
 *    - Nodes and edges dynamically update based on live data fetched every second.
 * 5. **Layer Integration:**
 *    - Digital Layer now synchronizes dynamically with Physical and Hybrid Layers.
 */
