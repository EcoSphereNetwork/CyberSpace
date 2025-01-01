import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { Object3D, Material, BufferGeometry } from 'three';

interface ModelProps {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  onLoad?: () => void;
}

export const Model: React.FC<ModelProps> = ({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  onLoad,
}) => {
  const { scene } = useGLTF(url);

  useEffect(() => {
    if (scene) {
      onLoad?.();
    }
  }, [scene, onLoad]);

  useEffect(() => {
    return () => {
      // Cleanup
      scene.traverse((object: Object3D) => {
        if ((object as any).geometry instanceof BufferGeometry) {
          (object as any).geometry.dispose();
        }
        if ((object as any).material instanceof Material) {
          (object as any).material.dispose();
        }
      });
    };
  }, [scene]);

  return (
    <primitive
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
};
