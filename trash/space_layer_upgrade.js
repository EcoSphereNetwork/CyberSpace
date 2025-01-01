import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export function SpaceLayer({ spaces, onEnterSpace, onPlaceItem }) {
  const [loadedSpaces, setLoadedSpaces] = useState([]);
  const [currentSpace, setCurrentSpace] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const loader = useRef(new GLTFLoader());

  useEffect(() => {
    const loadSpaces = async () => {
      const promises = spaces.map((space) =>
        loader.current.loadAsync(space.modelPath).then((gltf) => {
          return {
            id: space.id,
            model: gltf.scene,
            position: space.position,
            scale: space.scale || [1, 1, 1],
            name: space.name,
            portal: space.portal || null, // Portal information if available
          };
        })
      );
      const results = await Promise.all(promises);
      setLoadedSpaces(results);
    };

    loadSpaces();
  }, [spaces]);

  const handlePortalClick = (space) => {
    if (transitioning) return;

    setTransitioning(true);
    alert(`Entering space through portal: ${space.name}`);

    // Start the transition animation
    const energyTube = createEnergyTube();
    document.body.appendChild(energyTube);

    setTimeout(() => {
      document.body.removeChild(energyTube);
      setCurrentSpace(space);
      setTransitioning(false);
      if (onEnterSpace) onEnterSpace(space);
    }, 3000); // Transition duration
  };

  const createEnergyTube = () => {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = 0;
    container.style.left = 0;
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.background = 'radial-gradient(circle, rgba(0,255,255,0.8), rgba(0,0,128,0.8))';
    container.style.animation = 'pulse 3s infinite';
    container.style.zIndex = 1000;

    const styleSheet = document.styleSheets[0];
    styleSheet.insertRule(
      `@keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }`,
      styleSheet.cssRules.length
    );

    return container;
  };

  const handleHover = (e, space) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  };

  const handleHoverOut = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'default';
  };

  return (
    <group>
      {loadedSpaces.map((space) => (
        <primitive
          key={space.id}
          object={space.model}
          position={space.position}
          scale={space.scale}
        />
      ))}

      {loadedSpaces.map((space) =>
        space.portal ? (
          <mesh
            key={`portal-${space.id}`}
            position={space.portal.position}
            onClick={() => handlePortalClick(space)}
            onPointerOver={(e) => handleHover(e, space)}
            onPointerOut={handleHoverOut}
          >
            <torusGeometry args={[1, 0.2, 16, 100]} />
            <meshStandardMaterial color="cyan" emissive="blue" emissiveIntensity={0.8} />
          </mesh>
        ) : null
      )}

      {currentSpace && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 20,
          }}
        >
          <p>Current Space: {currentSpace.name}</p>
          <button onClick={() => setCurrentSpace(null)}>Exit Space</button>
        </div>
      )}
    </group>
  );
}

/**
 * Updated Features:
 * 1. **Portal Integration:**
 *    - Adds interactive portals for transitioning between spaces.
 *    - Portals are visualized as 3D torus models with emissive effects.
 * 2. **Space Navigation:**
 *    - Users can click portals to enter spaces.
 *    - Displays the current space with a UI overlay.
 * 3. **Transition Animation:**
 *    - Introduces an "Energy Tube" animation during space transitions.
 *    - Animated background simulates movement through a portal.
 */
