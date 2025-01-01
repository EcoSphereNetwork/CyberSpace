import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Tooltip } from './Scene';
import { Landmark } from './Scene';
import { PhysicalLayer } from './PhysicalLayer';
import { DigitalLayer } from './DigitalLayer';
import { HybridLayer } from './HybridLayer';

function CameraControls() {
  return <OrbitControls enablePan={true} enableRotate={true} enableZoom={true} />;
}

function Scene() {
  const landmarks = [
    { position: [2, 0, 1], color: 'brown', label: 'Building A', size: 0.8 },
    { position: [-3, 0, -2], color: 'blue', label: 'Building B', size: 0.6 },
    { position: [1, 1, 2], color: 'green', label: 'HQ', size: 1.0 },
    { position: [0, -1, 3], color: 'red', label: 'Data Center', size: 0.7 },
    { position: [-4, -1, -1], color: 'purple', label: 'Research Lab', size: 0.5 },
  ];

  const nodes = [
    { id: 1, position: [2, 2, 0], color: 'red', size: 0.3, label: 'Server A', status: 'active' },
    { id: 2, position: [-2, -2, 0], color: 'green', size: 0.25, label: 'Server B', status: 'warning' },
    { id: 3, position: [0, 3, 0], color: 'blue', size: 0.35, label: 'Server C', status: 'critical' },
  ];

  const edges = [
    { start: [2, 2, 0], end: [-2, -2, 0], color: 'yellow', speed: 0.03 },
    { start: [0, 3, 0], end: [2, 2, 0], color: 'cyan', speed: 0.02 },
    { start: [0, 3, 0], end: [-2, -2, 0], color: 'red', speed: 0.05 },
  ];

  return (
    <Canvas
      shadows
      style={{ height: '600px' }}
      camera={{ position: [0, 5, 10], fov: 50 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} castShadow />
      <HybridLayer landmarks={landmarks} nodes={nodes} edges={edges} />
      <CameraControls />
    </Canvas>
  );
}

export default Scene;
