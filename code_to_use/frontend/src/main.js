// frontend/src/main.js

import * as THREE from 'three';

// Hole das Canvas-Element
const canvas = document.getElementById('appCanvas');

// Erstelle Scene, Kamera und Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,                   // Blickwinkel
  window.innerWidth / window.innerHeight, // Seitenverhältnis
  0.1,                  // near
  1000                  // far
);

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Setze Kamera-Position (z.B. leicht zurück, damit wir was sehen)
camera.position.z = 5;

// Füge ein Testobjekt hinzu (Box)
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Animationsloop
function animate() {
  requestAnimationFrame(animate);

  // Bewege den Würfel
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  // Render die Szene
  renderer.render(scene, camera);
}
animate();

// Optional: Auf Fenstergröße reagieren
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

async function fetchHelloFromBackend() {
  try {
    const response = await fetch('http://localhost:3000/api/hello');
    const data = await response.json();
    console.log('Data from backend:', data);
  } catch (error) {
    console.error('Could not fetch from backend:', error);
  }
}

// Rufe die Funktion auf
fetchHelloFromBackend();
