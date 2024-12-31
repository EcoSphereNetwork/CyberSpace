import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface NetworkSceneProps {
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface NetworkNode {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
}

interface NetworkConnection {
  id: string;
  source: string;
  target: string;
  type: string;
}

interface NetworkData {
  nodes: NetworkNode[];
  connections: NetworkConnection[];
}

export const NetworkScene: React.FC<NetworkSceneProps> = ({ onLoad, onError }) => {
  const nodesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const connectionsRef = useRef<Map<string, THREE.Line>>(new Map());

  useEffect(() => {
    const loadNetwork = async () => {
      try {
        // Load network data
        const response = await fetch('/data/network.json');
        const networkData: NetworkData = await response.json();

        // Create nodes
        networkData.nodes.forEach((nodeData) => {
          const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
          const material = new THREE.MeshPhongMaterial({
            color: getNodeColor(nodeData.type),
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(
            nodeData.position.x,
            nodeData.position.y,
            nodeData.position.z
          );
          nodesRef.current.set(nodeData.id, mesh);
        });

        // Create connections
        networkData.connections.forEach((connectionData) => {
          const sourceNode = nodesRef.current.get(connectionData.source);
          const targetNode = nodesRef.current.get(connectionData.target);

          if (sourceNode && targetNode) {
            const points = [sourceNode.position, targetNode.position];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
              color: getConnectionColor(connectionData.type),
            });
            const line = new THREE.Line(geometry, material);
            connectionsRef.current.set(connectionData.id, line);
          }
        });

        // Notify load complete
        onLoad?.();
      } catch (error) {
        console.error('Failed to load network scene:', error);
        onError?.(error instanceof Error ? error : new Error('Failed to load network scene'));
      }
    };

    loadNetwork();

    // Cleanup
    return () => {
      nodesRef.current.clear();
      connectionsRef.current.clear();
    };
  }, [onLoad, onError]);

  // Update node rotations
  useFrame(() => {
    nodesRef.current.forEach((node) => {
      node.rotation.y += 0.01;
    });
  });

  const getNodeColor = (type: string): number => {
    switch (type) {
      case 'server':
        return 0x4caf50; // Green
      case 'client':
        return 0x2196f3; // Blue
      case 'router':
        return 0x9c27b0; // Purple
      default:
        return 0xcccccc; // Gray
    }
  };

  const getConnectionColor = (type: string): number => {
    switch (type) {
      case 'data':
        return 0x00ff00; // Green
      case 'control':
        return 0xff0000; // Red
      default:
        return 0xcccccc; // Gray
    }
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        minDistance={5}
        maxDistance={20}
      />

      {/* Nodes */}
      {Array.from(nodesRef.current.values()).map((node, index) => (
        <primitive key={index} object={node} />
      ))}

      {/* Connections */}
      {Array.from(connectionsRef.current.values()).map((line, index) => (
        <primitive key={index} object={line} />
      ))}

      {/* Lights */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
    </>
  );
};
