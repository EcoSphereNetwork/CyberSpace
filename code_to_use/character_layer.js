import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export function CharacterLayer({ characters }) {
  const [loadedCharacters, setLoadedCharacters] = useState([]);
  const loader = useRef(new GLTFLoader());

  useEffect(() => {
    const loadModels = async () => {
      const promises = characters.map((char) =>
        loader.current.loadAsync(char.modelPath).then((gltf) => {
          return {
            id: char.id,
            model: gltf.scene,
            position: char.position,
            scale: char.scale || [1, 1, 1],
            name: char.name,
          };
        })
      );
      const results = await Promise.all(promises);
      setLoadedCharacters(results);
    };

    loadModels();
  }, [characters]);

  return (
    <group>
      {loadedCharacters.map((char) => (
        <primitive
          key={char.id}
          object={char.model}
          position={char.position}
          scale={char.scale}
          onClick={() => alert(`Interacting with ${char.name}`)}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'default';
          }}
        />
      ))}
    </group>
  );
}

/**
 * Features:
 * 1. **Character Loading:**
 *    - Loads 3D character models using GLTFLoader.
 *    - Supports position and scaling customization.
 * 2. **Interactivity:**
 *    - Click interaction to trigger events (e.g., display character details).
 *    - Hover effect changes the cursor.
 */
