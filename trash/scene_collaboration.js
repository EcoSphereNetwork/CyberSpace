import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

export function CollaborativeScene({ onObjectUpdate, onLockUpdate, lockedNodes, onChatMessage }) {
  const { scene, camera } = useThree();
  const [selectedNode, setSelectedNode] = useState(null);
  const [locked, setLocked] = useState(lockedNodes || {});

  const handleObjectInteraction = (node) => {
    if (locked[node.id]) {
      alert(`Node ${node.id} is locked by another user.`);
      return;
    }

    // Lock the node for this user
    const updatedLocks = { ...locked, [node.id]: true };
    setLocked(updatedLocks);
    onLockUpdate(updatedLocks);

    // Simulate an update action
    setTimeout(() => {
      const updatedNode = {
        ...node,
        position: {
          x: node.position.x + 1,
          y: node.position.y,
          z: node.position.z,
        },
      };

      // Update the node state
      onObjectUpdate(updatedNode);

      // Unlock the node
      const unlocked = { ...updatedLocks };
      delete unlocked[node.id];
      setLocked(unlocked);
      onLockUpdate(unlocked);
    }, 2000); // Simulate a delay for the update action
  };

  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handlePointerDown = (event) => {
      const rect = event.target.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const clickedNode = intersects[0].object.userData;
        setSelectedNode(clickedNode);
        handleObjectInteraction(clickedNode);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [camera, scene, locked]);

  const sendChatMessage = (message) => {
    onChatMessage({ user: 'CurrentUser', message });
  };

  return (
    <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
      <p>Selected Node: {selectedNode ? selectedNode.id : 'None'}</p>
      <p>Locked Nodes: {Object.keys(locked).join(', ') || 'None'}</p>

      <div style={{ marginTop: '10px' }}>
        <textarea
          placeholder="Type a message"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              sendChatMessage(e.target.value);
              e.target.value = '';
            }
          }}
          style={{ width: '100%', height: '50px', resize: 'none' }}
        ></textarea>
      </div>
    </div>
  );
}

/**
 * Features:
 * 1. **Node Locking:**
 *    - Prevents multiple users from editing the same node simultaneously.
 * 2. **Real-time Updates:**
 *    - Simulates updates to node positions and state in real-time.
 * 3. **Interactive Selection:**
 *    - Users can click on objects in the scene to select and manipulate them.
 * 4. **Lock State Synchronization:**
 *    - Updates the lock state across all users.
 * 5. **Chat Integration:**
 *    - Adds a basic chat interface for user communication.
 */
