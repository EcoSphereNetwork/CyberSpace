import React, { useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

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
  const gltf = useLoader(GLTFLoader, url);

  useEffect(() => {
    if (gltf) {
      onLoad?.();
    }
  }, [gltf, onLoad]);

  return (
    <primitive
      object={gltf.scene}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
};
