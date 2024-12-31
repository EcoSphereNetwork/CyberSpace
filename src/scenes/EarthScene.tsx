import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface EarthSceneProps {
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const EarthScene: React.FC<EarthSceneProps> = ({ onLoad, onError }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const starsRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    try {
      // Create textures
      const textureLoader = new THREE.TextureLoader();
      const earthTexture = textureLoader.load('/textures/earth.jpg');
      const cloudsTexture = textureLoader.load('/textures/clouds.jpg');
      const starsTexture = textureLoader.load('/textures/stars.jpg');

      // Apply textures
      if (earthRef.current) {
        (earthRef.current.material as THREE.MeshPhongMaterial).map = earthTexture;
      }
      if (cloudsRef.current) {
        (cloudsRef.current.material as THREE.MeshPhongMaterial).map = cloudsTexture;
      }
      if (starsRef.current) {
        (starsRef.current.material as THREE.MeshBasicMaterial).map = starsTexture;
      }

      // Notify load complete
      onLoad?.();
    } catch (error) {
      console.error('Failed to load earth scene:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to load earth scene'));
    }
  }, [onLoad, onError]);

  // Update rotations
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0015;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        minDistance={3}
        maxDistance={10}
      />

      {/* Earth */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial />
      </mesh>

      {/* Clouds */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.05, 64, 64]} />
        <meshPhongMaterial transparent opacity={0.4} />
      </mesh>

      {/* Stars */}
      <mesh ref={starsRef}>
        <sphereGeometry args={[90, 64, 64]} />
        <meshBasicMaterial side={THREE.BackSide} />
      </mesh>

      {/* Lights */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
    </>
  );
};
