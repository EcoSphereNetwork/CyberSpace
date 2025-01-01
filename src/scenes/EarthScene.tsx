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
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const starsRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    // Load textures
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/textures/earth_daymap.jpg');
    const earthNormalMap = textureLoader.load('/textures/earth_normal_map.jpg');
    const earthSpecularMap = textureLoader.load('/textures/earth_specular_map.jpg');
    const cloudsTexture = textureLoader.load('/textures/earth_clouds.jpg');

    if (earthRef.current) {
      earthRef.current.material = new THREE.MeshPhongMaterial({
        map: earthTexture,
        normalMap: earthNormalMap,
        specularMap: earthSpecularMap,
        specular: new THREE.Color(0x333333),
        shininess: 25,
      });
    }

    if (cloudsRef.current) {
      cloudsRef.current.material = new THREE.MeshPhongMaterial({
        map: cloudsTexture,
        transparent: true,
        opacity: 0.8,
      });
    }

    if (atmosphereRef.current) {
      atmosphereRef.current.material = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
          }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      });
    }

    onLoad?.();
  }, [onLoad]);

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.1;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.12;
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

      {/* Earth */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
      </mesh>

      {/* Clouds */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.05, 64, 64]} />
      </mesh>

      {/* Atmosphere */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[2.1, 64, 64]} />
      </mesh>

      {/* Stars */}
      <mesh ref={starsRef}>
        <sphereGeometry args={[50, 64, 64]} />
        <meshBasicMaterial color={0x000000} side={THREE.BackSide} />
      </mesh>

      {/* Lights */}
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
    </>
  );
};
