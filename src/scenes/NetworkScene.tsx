import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { NetworkToolbar } from '@/components/network/NetworkToolbar';
import { NetworkSidebar } from '@/components/network/NetworkSidebar';
import { NetworkContextMenu } from '@/components/network/NetworkContextMenu';
import { createPortal } from 'react-dom';

interface NetworkSceneProps {
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface NetworkNode {
  id: string;
  type: 'server' | 'client' | 'router' | 'switch';
  position: { x: number; y: number; z: number };
  status: 'online' | 'offline' | 'warning' | 'error';
  metadata?: Record<string, any>;
}

interface NetworkLink {
  id: string;
  source: string;
  target: string;
  type: 'fiber' | 'copper' | 'wireless';
  bandwidth: number;
  latency: number;
  status: 'active' | 'inactive' | 'congested' | 'failed';
  metadata?: Record<string, any>;
}

interface NetworkPacket {
  id: string;
  source: string;
  target: string;
  type: 'data' | 'control' | 'error';
  size: number;
  priority: number;
  path: string[];
  metadata?: Record<string, any>;
}

interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
  packets: NetworkPacket[];
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  object: {
    id: string;
    type: string;
    status: 'online' | 'offline' | 'warning' | 'error';
  } | null;
}

export const NetworkScene: React.FC<NetworkSceneProps> = ({ onLoad, onError }) => {
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    object: null,
  });
  const [activeFilters, setActiveFilters] = useState({
    activeNodes: true,
    criticalPaths: false,
    warnings: true,
    errors: true,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const nodes = useRef<Map<string, THREE.Mesh>>(new Map());
  const links = useRef<Map<string, THREE.Line>>(new Map());
  const packets = useRef<Map<string, THREE.Mesh>>(new Map());
  const packetPaths = useRef<Map<string, { pathIndex: number; progress: number }>>(new Map());

  const { camera } = useThree();

  useEffect(() => {
    const loadNetwork = async () => {
      try {
        const response = await fetch('/data/network.json');
        if (!response.ok) {
          throw new Error(`Failed to load network data: ${response.statusText}`);
        }
        const data: NetworkData = await response.json();
        setNetworkData(data);
        onLoad?.();
      } catch (error) {
        console.error('Failed to load network data:', error);
        onError?.(error instanceof Error ? error : new Error('Failed to load network data'));
      }
    };

    loadNetwork();
  }, [onLoad, onError]);

  useEffect(() => {
    if (!networkData) return;

    // Create nodes
    networkData.nodes.forEach((nodeData) => {
      let geometry: THREE.BufferGeometry;
      switch (nodeData.type) {
        case 'server':
          geometry = new THREE.BoxGeometry(0.5, 0.75, 0.5);
          break;
        case 'client':
          geometry = new THREE.SphereGeometry(0.25);
          break;
        case 'router':
          geometry = new THREE.CylinderGeometry(0.25, 0.25, 0.5, 8);
          break;
        case 'switch':
          geometry = new THREE.OctahedronGeometry(0.3);
          break;
      }

      const material = new THREE.MeshPhongMaterial({
        color: getNodeColor(nodeData.type),
        emissive: getStatusColor(nodeData.status),
        emissiveIntensity: 0.5,
        shininess: 50,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(nodeData.position.x, nodeData.position.y, nodeData.position.z);
      mesh.userData = nodeData;
      nodes.current.set(nodeData.id, mesh);
    });

    // Create links
    networkData.links.forEach((linkData) => {
      const sourceNode = nodes.current.get(linkData.source);
      const targetNode = nodes.current.get(linkData.target);

      if (!sourceNode || !targetNode) return;

      // Add curve to the link
      const midPoint = sourceNode.position.clone().add(targetNode.position).multiplyScalar(0.5);
      midPoint.y += 0.5; // Add some height to the curve

      const curve = new THREE.QuadraticBezierCurve3(
        sourceNode.position.clone(),
        midPoint,
        targetNode.position.clone()
      );

      const curvePoints = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);

      const material = new THREE.LineBasicMaterial({
        color: getLinkColor(linkData.type),
        linewidth: 2,
        transparent: true,
        opacity: getLinkOpacity(linkData.status),
      });

      const line = new THREE.Line(geometry, material);
      line.userData = { ...linkData, curve };
      links.current.set(linkData.id, line);
    });

    // Create initial packets
    networkData.packets.forEach((packetData) => {
      createPacket(packetData);
    });

    return () => {
      // Cleanup
      nodes.current.forEach((node) => {
        node.geometry.dispose();
        (node.material as THREE.Material).dispose();
      });
      nodes.current.clear();

      links.current.forEach((link) => {
        link.geometry.dispose();
        (link.material as THREE.Material).dispose();
      });
      links.current.clear();

      packets.current.forEach((packet) => {
        packet.geometry.dispose();
        (packet.material as THREE.Material).dispose();
      });
      packets.current.clear();

      packetPaths.current.clear();
    };
  }, [networkData]);

  const createPacket = useCallback((packetData: NetworkPacket) => {
    const geometry = new THREE.SphereGeometry(0.1);
    const material = new THREE.MeshPhongMaterial({
      color: getPacketColor(packetData.type),
      emissive: getPacketColor(packetData.type),
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
    });

    const mesh = new THREE.Mesh(geometry, material);
    const sourceNode = nodes.current.get(packetData.path[0]);
    if (sourceNode) {
      mesh.position.copy(sourceNode.position);
    }

    mesh.userData = packetData;
    packets.current.set(packetData.id, mesh);
    packetPaths.current.set(packetData.id, { pathIndex: 0, progress: 0 });
  }, []);

  const getNodeColor = (type: string): number => {
    switch (type) {
      case 'server':
        return 0x4caf50; // Green
      case 'client':
        return 0x2196f3; // Blue
      case 'router':
        return 0x9c27b0; // Purple
      case 'switch':
        return 0xff9800; // Orange
      default:
        return 0xcccccc; // Gray
    }
  };

  const getStatusColor = (status: string): number => {
    switch (status) {
      case 'online':
        return 0x4caf50; // Green
      case 'offline':
        return 0x9e9e9e; // Gray
      case 'warning':
        return 0xff9800; // Orange
      case 'error':
        return 0xf44336; // Red
      default:
        return 0xcccccc; // Gray
    }
  };

  const getLinkColor = (type: string): number => {
    switch (type) {
      case 'fiber':
        return 0x00ff00; // Bright Green
      case 'copper':
        return 0xffeb3b; // Yellow
      case 'wireless':
        return 0x03a9f4; // Light Blue
      default:
        return 0xcccccc; // Gray
    }
  };

  const getLinkOpacity = (status: string): number => {
    switch (status) {
      case 'active':
        return 1;
      case 'inactive':
        return 0.3;
      case 'congested':
        return 0.6;
      case 'failed':
        return 0.1;
      default:
        return 0.5;
    }
  };

  const getPacketColor = (type: string): number => {
    switch (type) {
      case 'data':
        return 0x4caf50; // Green
      case 'control':
        return 0xff9800; // Orange
      case 'error':
        return 0xf44336; // Red
      default:
        return 0xcccccc; // Gray
    }
  };

  useFrame((state, delta) => {
    // Update packet positions
    packets.current.forEach((packet, id) => {
      const pathInfo = packetPaths.current.get(id);
      if (!pathInfo) return;

      const { path } = packet.userData;
      if (pathInfo.pathIndex >= path.length - 1) {
        // Packet reached destination
        packets.current.delete(id);
        packetPaths.current.delete(id);
        return;
      }

      const linkId = `${path[pathInfo.pathIndex]}-${path[pathInfo.pathIndex + 1]}`;
      const link = links.current.get(linkId);
      if (!link) return;

      const curve = link.userData.curve as THREE.QuadraticBezierCurve3;
      pathInfo.progress += delta * 2; // Adjust speed here

      if (pathInfo.progress >= 1) {
        // Move to next link
        pathInfo.pathIndex++;
        pathInfo.progress = 0;
      } else {
        // Update position along curve
        const position = curve.getPoint(pathInfo.progress);
        packet.position.copy(position);
      }
    });

    // Recreate packets that reached their destination
    if (networkData && Math.random() < 0.02) { // 2% chance per frame
      const randomPacket = networkData.packets[Math.floor(Math.random() * networkData.packets.length)];
      createPacket(randomPacket);
    }
  });

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    // TODO: Implement raycasting to find clicked object
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      object: {
        id: 'Node A',
        type: 'server',
        status: 'online',
      },
    });
  };

  const handleContextMenuAction = (action: string) => {
    console.log('Context menu action:', action);
    // TODO: Implement context menu actions
  };

  const handleFilterChange = (filters: { [key: string]: boolean }) => {
    setActiveFilters(filters);
    // TODO: Apply filters to network visualization
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // TODO: Implement search functionality
  };

  const handleZoomIn = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.multiplyScalar(0.9);
    }
  };

  const handleZoomOut = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.multiplyScalar(1.1);
    }
  };

  const handleResetCamera = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.set(0, 2, 10);
      camera.lookAt(0, 0, 0);
    }
  };

  const handleLayerChange = (layer: string) => {
    console.log('Layer changed:', layer);
    // TODO: Implement layer switching
  };

  const handleHelp = () => {
    console.log('Help clicked');
    // TODO: Implement help functionality
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 10]} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        minDistance={5}
        maxDistance={20}
      />

      {/* Nodes */}
      {Array.from(nodes.current.values()).map((node) => (
        <primitive key={node.userData.id} object={node} />
      ))}

      {/* Links */}
      {Array.from(links.current.values()).map((link) => (
        <primitive key={link.userData.id} object={link} />
      ))}

      {/* Packets */}
      {Array.from(packets.current.values()).map((packet) => (
        <primitive key={packet.userData.id} object={packet} />
      ))}

      {/* Lights */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
      <pointLight position={[5, 3, 5]} intensity={0.5} distance={20} decay={2} />

      {/* Background */}
      <mesh>
        <sphereGeometry args={[50, 32, 32]} />
        <meshBasicMaterial color={0x111111} side={THREE.BackSide} fog={false} />
      </mesh>

      {/* UI Overlays */}
      {createPortal(
        <>
          <NetworkToolbar
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetCamera={handleResetCamera}
            onLayerChange={handleLayerChange}
            onHelp={handleHelp}
          />

          <NetworkSidebar
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
          />

          {contextMenu.visible && contextMenu.object && (
            <NetworkContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              object={contextMenu.object}
              onAction={handleContextMenuAction}
              onClose={() => setContextMenu({ ...contextMenu, visible: false })}
            />
          )}
        </>,
        document.body
      )}
    </>
  );
};
