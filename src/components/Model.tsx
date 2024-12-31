import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

interface ModelProps {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const Model: React.FC<ModelProps> = ({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  onLoad,
  onError,
}) => {
  const { scene } = useGLTF(url) as GLTF;

  useEffect(() => {
    try {
      // Clone the scene to avoid sharing materials
      const clonedScene = scene.clone();
      onLoad?.();
      return () => {
        // Cleanup
        clonedScene.traverse((object) => {
          if ('geometry' in object) {
            object.geometry?.dispose();
          }
          if ('material' in object) {
            const material = object.material;
            if (Array.isArray(material)) {
              material.forEach((m) => m.dispose());
            } else {
              material?.dispose();
            }
          }
        });
      };
    } catch (error) {
      console.error('Failed to load model:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to load model'));
    }
  }, [scene, onLoad, onError]);

  return (
    <primitive
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
};
