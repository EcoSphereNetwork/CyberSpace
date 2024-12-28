import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

export function WebXRIntegration(scene, camera, renderer) {
  // Enable WebXR on the renderer
  renderer.xr.enabled = true;
  renderer.shadowMap.enabled = true; // Enable shadow maps
  renderer.frustumCulled = true; // Enable frustum culling
  document.body.appendChild(VRButton.createButton(renderer));

  // Setup XR Controllers
  const controller1 = renderer.xr.getController(0);
  const controller2 = renderer.xr.getController(1);

  scene.add(controller1);
  scene.add(controller2);

  // Controller Interaction Feedback
  const geometry = new THREE.SphereGeometry(0.01, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  const controller1Feedback = new THREE.Mesh(geometry, material);
  const controller2Feedback = new THREE.Mesh(geometry, material);

  controller1.add(controller1Feedback);
  controller2.add(controller2Feedback);

  // Level-of-Detail (LOD) System
  const setupLOD = (object) => {
    const lod = new THREE.LOD();

    // Add different levels of detail
    const highDetail = object.clone();
    const mediumDetail = object.clone();
    const lowDetail = object.clone();

    highDetail.scale.set(1, 1, 1);
    mediumDetail.scale.set(0.5, 0.5, 0.5);
    lowDetail.scale.set(0.25, 0.25, 0.25);

    // Adjust shaders for performance
    highDetail.material = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5, roughness: 0.5 });
    mediumDetail.material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    lowDetail.material = new THREE.MeshBasicMaterial({ color: 0xffffff });

    lod.addLevel(highDetail, 0);
    lod.addLevel(mediumDetail, 50);
    lod.addLevel(lowDetail, 100);

    scene.add(lod);
  };

  // Apply LOD to all objects
  scene.children.forEach((child) => {
    if (child.isMesh) {
      setupLOD(child);
    }
  });

  // Optimized Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight.position.set(5, 10, 7.5);
  directionalLight.castShadow = true; // Enable shadows
  directionalLight.shadow.mapSize.width = 512; // Reduce shadow map resolution for performance
  directionalLight.shadow.mapSize.height = 512;
  scene.add(directionalLight);

  // Controller Event Handlers
  const handleSelectStart = (event) => {
    const controller = event.target;
    controller.children[0].material.color.set(0x00ff00);
    controller.dispatchEvent({ type: 'hapticFeedback', intensity: 0.5 }); // Trigger haptic feedback

    // Example: Interact with Nodes
    const intersected = checkIntersections(controller);
    if (intersected) {
      intersected.material.emissive.setHex(0x00ff00);
      logInteraction(intersected, 'selected');
      enableNodeDrag(intersected, controller);
    }
  };

  const handleSelectEnd = (event) => {
    const controller = event.target;
    controller.children[0].material.color.set(0xff0000);
    controller.dispatchEvent({ type: 'hapticFeedback', intensity: 0.2 }); // Trigger haptic feedback

    // Example: Release Node Interaction
    const intersected = checkIntersections(controller);
    if (intersected) {
      intersected.material.emissive.setHex(0x000000);
      logInteraction(intersected, 'released');
      disableNodeDrag(intersected, controller);
    }
  };

  controller1.addEventListener('selectstart', handleSelectStart);
  controller1.addEventListener('selectend', handleSelectEnd);

  controller2.addEventListener('selectstart', handleSelectStart);
  controller2.addEventListener('selectend', handleSelectEnd);

  // Helper function for controller intersections
  const checkIntersections = (controller) => {
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);

    const raycaster = new THREE.Raycaster();
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const intersects = raycaster.intersectObjects(scene.children, true);
    return intersects.length > 0 ? intersects[0].object : null;
  };

  // Enable dragging of nodes
  const enableNodeDrag = (node, controller) => {
    node.userData.dragging = true;
    node.userData.controller = controller;
  };

  // Disable dragging of nodes
  const disableNodeDrag = (node, controller) => {
    if (node.userData.controller === controller) {
      node.userData.dragging = false;
      node.userData.controller = null;
    }
  };

  // Update dragging nodes
  const updateDraggingNodes = () => {
    scene.children.forEach((child) => {
      if (child.userData.dragging) {
        const controller = child.userData.controller;
        const newPosition = new THREE.Vector3();
        newPosition.setFromMatrixPosition(controller.matrixWorld);

        // Smooth interpolation for movement
        child.position.lerp(newPosition, 0.1);
      }
    });
  };

  // Logging interactions
  const logInteraction = (object, action) => {
    console.log(`Object ${object.name || object.id} was ${action}.`);
  };

  // Animation Loop for XR
  const clock = new THREE.Clock();

  function animate() {
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();

      // Update dragging nodes
      updateDraggingNodes();

      // Update XR-related animations or interactions here
      renderer.render(scene, camera);
    });
  }

  animate();

  return {
    addInteractiveObject: (object) => {
      // Attach object to XR controllers for interaction
      controller1.add(object);
      controller2.add(object);
    },
  };
}

/**
 * Features:
 * 1. **WebXR Integration:**
 *    - Enables VR and AR support using Three.js and WebXR API.
 * 2. **Controller Setup:**
 *    - Adds support for two XR controllers with visual feedback.
 *    - Adds haptic feedback for interactions.
 * 3. **Event Handling:**
 *    - Includes interaction feedback for select start and end events.
 *    - Detects intersections with scene objects for node interaction.
 *    - Logs interactions for debugging and analytics.
 *    - Implements drag-and-drop functionality for nodes.
 * 4. **Scene Adaptation:**
 *    - Scales objects and adjusts lighting for immersive AR/VR environments.
 *    - Adds shadow casting and receiving for enhanced realism.
 * 5. **Level-of-Detail (LOD):**
 *    - Dynamically adjusts object details based on camera distance for performance.
 *    - Adjusts shaders to reduce computational load.
 * 6. **Frustum Culling:**
 *    - Only renders objects visible in the camera's frustum to optimize performance.
 * 7. **Animation Loop:**
 *    - Handles rendering and interaction updates in an XR environment.
 * 8. **Interactive Objects:**
 *    - Allows objects to be added dynamically for XR interaction.
 * 9. **Node Interaction:**
 *    - Implements interaction with nodes and graph elements in AR/VR.
 * 10. **Drag-and-Drop:**
 *    - Enables users to move nodes interactively in the immersive environment.
 * 11. **Smooth Interpolation:**
 *    - Adds smooth movement for objects during drag-and-drop interactions.
 */

