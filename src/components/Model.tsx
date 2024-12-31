import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import type { GLTF as GLTFType } from 'three/examples/jsm/loaders/GLTFLoader';
import type { Object3D, Material, BufferGeometry } from 'three';

interface ModelProps {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

type GLTFResult = GLTFType & {
  nodes: { [key: string]: Object3D };
  materials: { [key: string]: Material };
};

export const Model: React.FC<ModelProps> = ({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  onLoad,
  onError,
}) => {
  const { scene } = useGLTF(url) as GLTFResult;

  useEffect(() => {
    try {
      // Clone the scene to avoid sharing materials
      const clonedScene = scene.clone();
      onLoad?.();
      return () => {
        // Cleanup
        clonedScene.traverse((object) => {
          if ((object as any).geometry instanceof BufferGeometry) {
            (object as any).geometry.dispose();
          }
          if ((object as any).material instanceof Material) {
            const material = (object as any).material;
            if (Array.isArray(material)) {
              material.forEach((m) => m.dispose());
            } else {
              material.dispose();
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

// Pre-load the model to avoid loading it multiple times
useGLTF.preload('/models/default.glb');
