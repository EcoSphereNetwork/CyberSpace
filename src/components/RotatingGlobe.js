import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const RotatingGlobe = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 1.7;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const earthGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load('texture/earthmap.jpeg'),
      bumpMap: new THREE.TextureLoader().load('texture/earthbump.jpeg'),
      bumpScale: 0.01,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);

    const cloudGeometry = new THREE.SphereGeometry(0.52, 32, 32);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load('texture/earthCloud.png'),
      transparent: true,
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(cloudMesh);

    const starGeometry = new THREE.SphereGeometry(5, 64, 64);
    const starMaterial = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load('texture/galaxy.png'),
      side: THREE.BackSide,
    });
    const starMesh = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(starMesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.9);
    pointLight.position.set(5, 3, 5);
    scene.add(pointLight);

    const animate = () => {
      requestAnimationFrame(animate);
      earthMesh.rotation.y += 0.001;
      cloudMesh.rotation.y += 0.001;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default RotatingGlobe;
