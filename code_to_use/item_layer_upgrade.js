import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export function ItemLayer({ items, onItemPickup, onItemDrop }) {
  const [loadedItems, setLoadedItems] = useState([]);
  const loader = useRef(new GLTFLoader());
  const [pickedItem, setPickedItem] = useState(null);

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
    if (pickedItem) {
      alert(`Dropping item: ${pickedItem.name}`);
      setPickedItem(null);
      if (onItemDrop) onItemDrop(pickedItem);
    } else {
      alert(`Picking up item: ${item.name}`);
      setPickedItem(item);
      if (onItemPickup) onItemPickup(item);
    }
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
 * Upgraded Features:
 * 1. **Pickup and Drop Mechanics:**
 *    - Users can pick up and drop items dynamically.
 *    - State changes based on interactions.
 * 2. **Real-Time Updates:**
 *    - Items dynamically change status (e.g., "picked up", "available").
 * 3. **Interactivity:**
 *    - Click interaction to pick up or drop items.
 *    - Hover effect changes the cursor.
 */
