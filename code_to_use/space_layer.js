import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export function SpaceLayer({ spaces }) {
  const [loadedSpaces, setLoadedSpaces] = useState([]);
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
          };
        })
      );
      const results = await Promise.all(promises);
      setLoadedSpaces(results);
    };

    loadSpaces();
  }, [spaces]);

  const handleSpaceClick = (space) => {
    alert(`Entering space: ${space.name}`);
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
          onClick={() => handleSpaceClick(space)}
          onPointerOver={(e) => handleHover(e, space)}
          onPointerOut={handleHoverOut}
        />
      ))}
    </group>
  );
}

/**
 * Features:
 * 1. **Space Loading:**
 *    - Loads 3D space models using GLTFLoader.
 *    - Supports position and scale customization.
 * 2. **Interactivity:**
 *    - Click interaction to "enter" a space.
 *    - Hover effect changes the cursor.
 * 3. **User-Defined Spaces:**
 *    - Supports user-uploaded spaces for custom environments.
 */
