import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { ResourceManager } from '@/core/ResourceManager';

interface EarthSceneProps {
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const EarthScene: React.FC<EarthSceneProps> = ({ onLoad, onError }) => {
  const { scene } = useThree();
  const resourceManager = ResourceManager.getInstance();
  const earthRef = useRef<THREE.Mesh>();
  const cloudsRef = useRef<THREE.Mesh>();
  const starsRef = useRef<THREE.Mesh>();

  useEffect(() => {
    const loadResources = async () => {
      try {
        // Load textures
        const earthTexture = await resourceManager.load('/textures/earth.jpg', 'texture');
        const cloudsTexture = await resourceManager.load('/textures/clouds.jpg', 'texture');
        const starsTexture = await resourceManager.load('/textures/stars.jpg', 'texture');

        // Create Earth
        const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
        const earthMaterial = new THREE.MeshPhongMaterial({
          map: earthTexture,
          bumpScale: 0.05,
        });
        const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earthMesh);
        earthRef.current = earthMesh;

        // Create clouds
        const cloudsGeometry = new THREE.SphereGeometry(2.05, 64, 64);
        const cloudsMaterial = new THREE.MeshPhongMaterial({
          map: cloudsTexture,
          transparent: true,
          opacity: 0.4,
        });
        const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
        scene.add(cloudsMesh);
        cloudsRef.current = cloudsMesh;

        // Create stars
        const starsGeometry = new THREE.SphereGeometry(90, 64, 64);
        const starsMaterial = new THREE.MeshBasicMaterial({
          map: starsTexture,
          side: THREE.BackSide,
        });
        const starsMesh = new THREE.Mesh(starsGeometry, starsMaterial);
        scene.add(starsMesh);
        starsRef.current = starsMesh;

        // Notify load complete
        onLoad?.();
      } catch (error) {
        console.error('Failed to load earth scene:', error);
        onError?.(error instanceof Error ? error : new Error('Failed to load earth scene'));
      }
    };

    loadResources();

    // Cleanup
    return () => {
      // Remove and dispose Earth
      if (earthRef.current) {
        scene.remove(earthRef.current);
        earthRef.current.geometry.dispose();
        (earthRef.current.material as THREE.Material).dispose();
      }

      // Remove and dispose clouds
      if (cloudsRef.current) {
        scene.remove(cloudsRef.current);
        cloudsRef.current.geometry.dispose();
        (cloudsRef.current.material as THREE.Material).dispose();
      }

      // Remove and dispose stars
      if (starsRef.current) {
        scene.remove(starsRef.current);
        starsRef.current.geometry.dispose();
        (starsRef.current.material as THREE.Material).dispose();
      }
    };
  }, [scene, onLoad, onError]);

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
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
    </>
  );
};
