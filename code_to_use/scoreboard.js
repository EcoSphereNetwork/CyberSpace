// Updated main.js to integrate PvP Dashboard and Scoreboard modules
import * as THREE from 'three';
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sidebar } from './Sidebar';
import { NotificationSystem } from './NotificationSystem';
import { PluginWindows } from './PluginWindows';
import { ResourceManager } from './ResourceManager';
import { Minimap } from './Minimap';
import { Scoreboard } from './Scoreboard';
import { PvPDashboard } from './PvPDashboard';
import { GraphController } from './GraphController';
import { NavBar } from './NavBar';

function RotatingGlobe() {
  const globeRef = useRef();

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('textures/earthmap.jpg');
    globeRef.current.material.map = texture;
  }, []);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001; // Rotate the globe
    }
  });

  return (
    <mesh ref={globeRef}>
      <sphereGeometry args={[5, 64, 64]} />
      <meshStandardMaterial />
    </mesh>
  );
}

function MainApp() {
  return (
    <div className="app-container">
      <NavBar />
      <Sidebar />
      <NotificationSystem />
      <PluginWindows />
      <ResourceManager />
      <Minimap />
      <Scoreboard />
      <PvPDashboard />
      <GraphController />
      <div className="main-scene">
        <RotatingGlobe />
      </div>
    </div>
  );
}

export default MainApp;
