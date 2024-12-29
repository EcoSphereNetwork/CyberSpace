import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

export function Minimap({ size = 200, showGrid = true, showNodes = true }) {
  const { scene, camera } = useThree();
  const minimapRef = useRef();

  useEffect(() => {
    const minimapCamera = new THREE.OrthographicCamera(
      -size / 2,
      size / 2,
      size / 2,
      -size / 2,
      0.1,
      1000
    );
    minimapCamera.position.set(0, 50, 0);
    minimapCamera.lookAt(0, 0, 0);

    const minimapRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    minimapRenderer.setSize(size, size);
    minimapRenderer.domElement.style.position = 'absolute';
    minimapRenderer.domElement.style.bottom = '10px';
    minimapRenderer.domElement.style.right = '10px';
    minimapRenderer.domElement.style.border = '2px solid #fff';
    minimapRenderer.domElement.style.backgroundColor = '#000';

    minimapRef.current.appendChild(minimapRenderer.domElement);

    const gridHelper = new THREE.GridHelper(size, 10);
    if (showGrid) {
      scene.add(gridHelper);
    }

    const renderMinimap = () => {
      minimapRenderer.render(scene, minimapCamera);
    };

    renderMinimap();
    const animationId = requestAnimationFrame(renderMinimap);

    return () => {
      cancelAnimationFrame(animationId);
      minimapRenderer.dispose();
      minimapRef.current.removeChild(minimapRenderer.domElement);
      if (showGrid) {
        scene.remove(gridHelper);
      }
    };
  }, [scene, size, showGrid]);

  const handleMinimapClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const minimapCamera = new THREE.OrthographicCamera(
      -size / 2,
      size / 2,
      size / 2,
      -size / 2,
      0.1,
      1000
    );
    const pointer = new THREE.Vector2(x, y);

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, minimapCamera);

    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      camera.position.set(
        intersects[0].point.x,
        camera.position.y,
        intersects[0].point.z
      );
      camera.lookAt(intersects[0].point);
    }
  };

  return (
    <>
      <div ref={minimapRef} onClick={handleMinimapClick} />
      {showNodes && (
        <div
          style={{
            position: 'absolute',
            bottom: `${size + 20}px`,
            right: '10px',
            backgroundColor: '#333',
            padding: '10px',
            borderRadius: '5px',
            color: '#fff',
          }}
        >
          <p>Nodes: {scene.children.length}</p>
        </div>
      )}
    </>
  );
}

/**
 * Features:
 * 1. **Interactive Minimap:**
 *    - Displays an overhead view of the 3D scene.
 *    - Users can click on the minimap to navigate to specific areas.
 * 2. **Camera Synchronization:**
 *    - Updates the main camera position based on minimap interactions.
 * 3. **Customizable Options:**
 *    - Option to show/hide grid and node count.
 * 4. **Dynamic Node Counter:**
 *    - Displays the number of objects in the scene.
 */
