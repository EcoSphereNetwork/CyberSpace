import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export function ItemLayer({ items }) {
  const [loadedItems, setLoadedItems] = useState([]);
  const loader = useRef(new GLTFLoader());

  useEffect(() => {
    const loadModels = async () => {
      const promises = items.map((item) =>
        loader.current.loadAsync(item.modelPath).then((gltf) => {
          return {
            id: item.id,
            model: gltf.scene,
            position: item.position,
            scale: item.scale || [1, 1, 1],
            name: item.name,
            status: item.status || 'available',
          };
        })
      );
      const results = await Promise.all(promises);
      setLoadedItems(results);
    };

    loadModels();
  }, [items]);

  const handleItemClick = (item) => {
    alert(`Interacting with item: ${item.name}\nStatus: ${item.status}`);
  };

  const handleHover = (e, item) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  };

  const handleHoverOut = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'default';
  };

  return (
    <group>
      {loadedItems.map((item) => (
        <primitive
          key={item.id}
          object={item.model}
          position={item.position}
          scale={item.scale}
          onClick={() => handleItemClick(item)}
          onPointerOver={(e) => handleHover(e, item)}
          onPointerOut={handleHoverOut}
        />
      ))}
    </group>
  );
}

/**
 * Features:
 * 1. **Item Loading:**
 *    - Loads 3D item models using GLTFLoader.
 *    - Supports position, scale, and status customization.
 * 2. **Interactivity:**
 *    - Click interaction to display item details.
 *    - Hover effect changes the cursor.
 * 3. **Status Integration:**
 *    - Displays item status dynamically in interactions.
 */
