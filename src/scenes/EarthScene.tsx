import React, { useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface EarthSceneProps {
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const EarthScene: React.FC<EarthSceneProps> = ({ onLoad, onError }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const starsRef = useRef<THREE.Mesh>(null);

  // Load textures
  const [
    earthTexture,
    cloudsTexture,
    nightTexture,
    normalTexture,
    specularTexture,
  ] = useLoader(THREE.TextureLoader, [
    '/textures/earth.jpg',
    '/textures/clouds.jpg',
    '/textures/night.jpg',
    '/textures/normal.jpg',
    '/textures/specular.jpg',
  ]);

  useEffect(() => {
    try {
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
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.001;
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
        <meshPhongMaterial
          map={earthTexture}
          normalMap={normalTexture}
          specularMap={specularTexture}
          emissiveMap={nightTexture}
          emissive={0xffffff}
          emissiveIntensity={0.1}
          specular={0x666666}
          shininess={25}
        />
      </mesh>

      {/* Clouds */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.05, 64, 64]} />
        <meshPhongMaterial
          map={cloudsTexture}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[2.1, 64, 64]} />
        <meshPhongMaterial
          color={0x88ccff}
          transparent
          opacity={0.2}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Stars */}
      <mesh ref={starsRef}>
        <sphereGeometry args={[90, 64, 64]} />
        <meshBasicMaterial
          color={0x111111}
          side={THREE.BackSide}
          fog={false}
        />
      </mesh>

      {/* Lights */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
      <pointLight position={[5, 3, 5]} intensity={0.5} distance={20} decay={2} />
    </>
  );
};
