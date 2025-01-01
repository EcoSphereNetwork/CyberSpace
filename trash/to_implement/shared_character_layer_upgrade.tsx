// Converted to TypeScript with JSX
import React from 'react';
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export export function CharacterLayer({ characters }) {
  const [loadedCharacters, setLoadedCharacters] = useState([]);
  const loader = useRef(new GLTFLoader());

  useEffect(() => {
    const loadModels = async () => {
      const promises = characters.map((char) =>
        loader.current.loadAsync(char.modelPath).then((gltf) => {
          const mixer = new THREE.AnimationMixer(gltf.scene);
          if (gltf.animations.length > 0) {
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
          }
          return {
            id: char.id,
            model: gltf.scene,
            position: char.position,
            scale: char.scale || [1, 1, 1],
            name: char.name,
            mixer,
          };
        })
      );
      const results = await Promise.all(promises);
      setLoadedCharacters(results);
    };

    loadModels();
  }, [characters]);

  useEffect(() => {
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      loadedCharacters.forEach((char) => {
        if (char.mixer) char.mixer.update(delta);
      });
      requestAnimationFrame(animate);
    };

    animate();
  }, [loadedCharacters]);

  const handleCharacterClick = (char) => {
    alert(`Interacting with character: ${char.name}`);
  };

  const handleHover = (e, char) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  };

  const handleHoverOut = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'default';
  };

  return (
    <group>
      {loadedCharacters.map((char) => (
        <primitive
          key={char.id}
          object={char.model}
          position={char.position}
          scale={char.scale}
          onClick={() => handleCharacterClick(char)}
          onPointerOver={(e) => handleHover(e, char)}
          onPointerOut={handleHoverOut}
        />
      ))}
    </group>
  );
}

/**
 * Upgraded Features:
 * 1. **Animation Support:**
 *    - Characters now support animations if available in GLTF files.
 *    - Animations are automatically played using THREE.AnimationMixer.
 * 2. **Real-Time Updates:**
 *    - Continuous animation updates using requestAnimationFrame.
 * 3. **Interactivity:**
 *    - Click interaction to display character details.
 *    - Hover effect changes the cursor.
 */
