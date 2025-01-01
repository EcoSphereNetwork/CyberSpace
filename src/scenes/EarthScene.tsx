import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'server' | 'client' | 'datacenter';
  status: 'online' | 'offline' | 'warning';
}

interface Connection {
  id: string;
  source: string;
  target: string;
  type: 'network' | 'data' | 'control';
  status: 'active' | 'inactive' | 'error';
}

interface EarthSceneProps {
  onLoad?: () => void;
  onError?: (error: Error) => void;
  locations?: Location[];
  connections?: Connection[];
  onLocationClick?: (location: Location) => void;
  onConnectionClick?: (connection: Connection) => void;
  onLocationHover?: (location: Location | null) => void;
  onConnectionHover?: (connection: Connection | null) => void;
}

export const EarthScene: React.FC<EarthSceneProps> = ({
  onLoad,
  onError,
  locations = [],
  connections = [],
  onLocationClick,
  onConnectionClick,
  onLocationHover,
  onConnectionHover,
}) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const starsRef = useRef<THREE.Mesh>(null);
  const locationsRef = useRef<THREE.Group>(null);
  const connectionsRef = useRef<THREE.Group>(null);
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const [hoveredConnection, setHoveredConnection] = useState<Connection | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);

  // Convert lat/long to 3D coordinates
  const latLongToVector3 = (lat: number, long: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (long + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

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

  // Create location markers
  const createLocationMarker = (location: Location) => {
    const position = latLongToVector3(location.latitude, location.longitude, 2);
    const color = location.status === 'online' ? 0x00ff00 : location.status === 'warning' ? 0xffff00 : 0xff0000;
    const scale = location.type === 'datacenter' ? 0.15 : 0.1;

    return (
      <mesh
        key={location.id}
        position={position}
        onClick={() => {
          setSelectedLocation(location);
          onLocationClick?.(location);
        }}
        onPointerOver={() => {
          setHoveredLocation(location);
          onLocationHover?.(location);
        }}
        onPointerOut={() => {
          setHoveredLocation(null);
          onLocationHover?.(null);
        }}
      >
        <sphereGeometry args={[scale, 16, 16]} />
        <meshPhongMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hoveredLocation?.id === location.id ? 0.5 : 0.2}
        />
      </mesh>
    );
  };

  // Create connection lines
  const createConnectionLine = (connection: Connection) => {
    const source = locations.find(l => l.id === connection.source);
    const target = locations.find(l => l.id === connection.target);
    if (!source || !target) return null;

    const start = latLongToVector3(source.latitude, source.longitude, 2);
    const end = latLongToVector3(target.latitude, target.longitude, 2);
    const color = connection.status === 'active' ? 0x00ff00 : connection.status === 'error' ? 0xff0000 : 0x666666;

    // Create a curved line between points
    const curve = new THREE.QuadraticBezierCurve3(
      start,
      new THREE.Vector3(
        (start.x + end.x) * 0.5,
        (start.y + end.y) * 0.5,
        (start.z + end.z) * 0.5 + 1
      ),
      end
    );

    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    return (
      <line
        key={connection.id}
        onClick={() => {
          setSelectedConnection(connection);
          onConnectionClick?.(connection);
        }}
        onPointerOver={() => {
          setHoveredConnection(connection);
          onConnectionHover?.(connection);
        }}
        onPointerOut={() => {
          setHoveredConnection(null);
          onConnectionHover?.(null);
        }}
      >
        <bufferGeometry attach="geometry" {...geometry} />
        <lineBasicMaterial
          attach="material"
          color={color}
          linewidth={hoveredConnection?.id === connection.id ? 2 : 1}
          opacity={hoveredConnection?.id === connection.id ? 1 : 0.6}
          transparent
        />
      </line>
    );
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

      {/* Location Markers */}
      <group ref={locationsRef}>
        {locations.map(location => createLocationMarker(location))}
      </group>

      {/* Connection Lines */}
      <group ref={connectionsRef}>
        {connections.map(connection => createConnectionLine(connection))}
      </group>

      {/* Lights */}
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
    </>
  );
};
