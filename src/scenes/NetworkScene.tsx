import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { ResourceManager } from '@/core/ResourceManager';
import { Node } from '@/models/Node';

interface NetworkSceneProps {
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const NetworkScene: React.FC<NetworkSceneProps> = ({ onLoad, onError }) => {
  const { scene } = useThree();
  const resourceManager = ResourceManager.getInstance();
  const nodesRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const connectionsRef = useRef<Map<string, THREE.Line>>(new Map());

  useEffect(() => {
    const loadResources = async () => {
      try {
        // Load resources
        const networkData = await resourceManager.load('/data/network.json', 'json');

        // Create nodes
        for (const nodeData of networkData.nodes) {
          const node = new Node(nodeData.type);
          const mesh = node.getMesh();
          mesh.position.set(
            nodeData.position.x,
            nodeData.position.y,
            nodeData.position.z
          );
          scene.add(mesh);
          nodesRef.current.set(nodeData.id, mesh);
        }

        // Create connections
        for (const connectionData of networkData.connections) {
          const sourceNode = nodesRef.current.get(connectionData.source);
          const targetNode = nodesRef.current.get(connectionData.target);

          if (sourceNode && targetNode) {
            const points = [sourceNode.position, targetNode.position];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
              color: 0x00ff00,
              linewidth: 2,
            });
            const line = new THREE.Line(geometry, material);
            scene.add(line);
            connectionsRef.current.set(connectionData.id, line);
          }
        }

        // Notify load complete
        onLoad?.();
      } catch (error) {
        console.error('Failed to load network scene:', error);
        onError?.(error instanceof Error ? error : new Error('Failed to load network scene'));
      }
    };

    loadResources();

    // Cleanup
    return () => {
      // Remove nodes
      for (const node of nodesRef.current.values()) {
        scene.remove(node);
        if ('geometry' in node) {
          node.geometry.dispose();
        }
        if ('material' in node) {
          const material = node.material;
          if (Array.isArray(material)) {
            material.forEach(m => m.dispose());
          } else {
            material.dispose();
          }
        }
      }
      nodesRef.current.clear();

      // Remove connections
      for (const connection of connectionsRef.current.values()) {
        scene.remove(connection);
        connection.geometry.dispose();
        (connection.material as THREE.Material).dispose();
      }
      connectionsRef.current.clear();
    };
  }, [scene, onLoad, onError]);

  // Update node rotations
  useFrame(() => {
    for (const node of nodesRef.current.values()) {
      node.rotation.y += 0.01;
    }
  });

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
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
    </>
  );
};
