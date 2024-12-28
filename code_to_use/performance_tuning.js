// Performance Tuning Module

import * as THREE from 'three';

export function optimizeRendering(scene, renderer, camera) {
  // Enable shadow maps for realistic lighting
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Adjust renderer settings for performance
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Dynamic resolution scaling
  const setDynamicResolution = () => {
    const baseResolution = 1280;
    const scale = Math.min(1, baseResolution / window.innerWidth);
    renderer.setPixelRatio(scale);
  };
  window.addEventListener('resize', setDynamicResolution);
  setDynamicResolution();

  // Frustum Culling
  scene.children.forEach((child) => {
    if (child.isMesh) {
      child.frustumCulled = true;
    }
  });

  // Use LOD (Level of Detail) for complex objects
  const setupLOD = (object) => {
    const lod = new THREE.LOD();

    // Add different levels of detail
    const highDetail = object.clone();
    const mediumDetail = object.clone();
    const lowDetail = object.clone();

    highDetail.scale.set(1, 1, 1);
    mediumDetail.scale.set(0.5, 0.5, 0.5);
    lowDetail.scale.set(0.25, 0.25, 0.25);

    highDetail.material = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5, roughness: 0.5 });
    mediumDetail.material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    lowDetail.material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });

    lod.addLevel(highDetail, 0);
    lod.addLevel(mediumDetail, 50);
    lod.addLevel(lowDetail, 100);

    scene.add(lod);
  };

  scene.children.forEach((child) => {
    if (child.isMesh) {
      setupLOD(child);
    }
  });

  // Enable Adaptive Tone Mapping
  const adaptiveToneMappingPass = new THREE.AdaptiveToneMappingPass();
  adaptiveToneMappingPass.setMaxLuminance(1.0);
  adaptiveToneMappingPass.setMinLuminance(0.1);
  scene.add(adaptiveToneMappingPass);

  // Add Performance Monitoring Overlay
  const stats = new Stats();
  document.body.appendChild(stats.dom);

  // Advanced Culling System
  const advancedCulling = () => {
    const frustum = new THREE.Frustum();
    const cameraViewProjectionMatrix = new THREE.Matrix4();

    camera.updateMatrixWorld();
    cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);

    scene.traverse((object) => {
      if (object.isMesh) {
        object.visible = frustum.intersectsObject(object);
      }
    });
  };

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    stats.begin();

    const delta = clock.getDelta();

    advancedCulling();

    // Update rendering optimizations dynamically
    scene.traverse((object) => {
      if (object.isMesh) {
        object.visible = object.frustumCulled && camera.isObject3D;
      }
    });

    renderer.render(scene, camera);
    stats.end();

    requestAnimationFrame(animate);
  }

  animate();

  return {
    resize: () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    },
  };
}

/**
 * Features:
 * 1. **Dynamic Resolution Scaling:**
 *    - Adjusts renderer resolution based on device capabilities.
 * 2. **Level of Detail (LOD):**
 *    - Reduces object complexity based on camera distance.
 * 3. **Frustum Culling:**
 *    - Only renders objects visible in the camera's frustum.
 * 4. **Shadow Optimization:**
 *    - Uses PCFSoftShadowMap for high-quality yet efficient shadows.
 * 5. **Adaptive Tone Mapping:**
 *    - Enhances visual clarity dynamically based on scene brightness.
 * 6. **Performance Monitoring:**
 *    - Adds real-time performance statistics using the `Stats` library.
 * 7. **Enhanced LOD Materials:**
 *    - Custom materials for different detail levels to balance performance and visuals.
 * 8. **Advanced Culling System:**
 *    - Implements frustum-based culling for improved efficiency.
 */
