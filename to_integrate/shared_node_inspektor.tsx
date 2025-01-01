// Converted to TypeScript with JSX
import React from 'react';
import React, { useState } from 'react';

export export function NodeInspector({ selectedNode, onClose }) {
  const [expanded, setExpanded] = useState(false);

  if (!selectedNode) {
    return null;
  }

  const toggleDetails = () => {
    setExpanded(!expanded);
  };

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      width: '300px',
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      borderRadius: '5px',
      boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
      padding: '15px',
      zIndex: 1000,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Node Inspector</h3>
        <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px' }}>✖</button>
      </div>

      <div style={{ marginTop: '10px' }}>
        <p><strong>ID:</strong> {selectedNode.id}</p>
        <p><strong>Name:</strong> {selectedNode.name}</p>
        <p><strong>Status:</strong> {selectedNode.status}</p>
        <p><strong>Connections:</strong> {selectedNode.connections.length}</p>
      </div>

      <button onClick={toggleDetails} style={{
        marginTop: '10px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '3px',
        padding: '10px 15px',
        cursor: 'pointer',
      }}>
        {expanded ? 'Hide Details' : 'Show Details'}
      </button>

      {expanded && (
        <div style={{ marginTop: '15px' }}>
          <h4>Connection Details:</h4>
          <ul>
            {selectedNode.connections.map((connection, index) => (
              <li key={index}>
                <strong>Target:</strong> {connection.target}<br />
                <strong>Type:</strong> {connection.type}<br />
                <strong>Status:</strong> {connection.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Features:
 * 1. **Node Information Display:**
 *    - Displays the basic details of a selected node (ID, name, status, connections).
 * 2. **Expandable Details:**
 *    - Users can toggle additional details about the node's connections.
 * 3. **Interactive UI:**
 *    - Close button and expandable sections for better usability.
 */
