// Updated main.js with integration for additional modules and comprehensive structure
import * as THREE from 'three';
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sidebar } from './Sidebar.js';
import { NotificationSystem } from './NotificationSystem.js';
import { PluginWindows } from './PluginWindows.js';
import { ResourceManager } from './ResourceManager.js';
import { Minimap } from './Minimap.js';
import { Scoreboard } from './Scoreboard.js';
import { PvPDashboard } from './PvPDashboard.js';
import { GraphController } from './GraphController.js';
import { NavBar } from './NavBar.js';

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


// Main.js implementation for Three.js rendering
import * as THREE from './three.js';

// Initialize the scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('globe') });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a sphere (Earth) to the scene
const geometry = new THREE.SphereGeometry(5, 64, 64);
const texture = new THREE.TextureLoader().load('textures/earthmap.jpg');
const material = new THREE.MeshStandardMaterial({ map: texture });
const globe = new THREE.Mesh(geometry, material);
scene.add(globe);

// Add lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Position camera
camera.position.z = 15;

// Render loop
function animate() {
    requestAnimationFrame(animate);
    globe.rotation.y += 0.001; // Rotate globe slowly
    renderer.render(scene, camera);
}

animate();
