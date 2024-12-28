import React, { useState } from 'react';

export function ResourceManager({ resources, onResourceUpdate }) {
  const [expanded, setExpanded] = useState(false);

  const handleAdjustment = (resourceType, adjustment) => {
    const updatedResources = {
      ...resources,
      [resourceType]: Math.max(resources[resourceType] + adjustment, 0),
    };
    onResourceUpdate(updatedResources);
  };

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      width: '300px',
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      borderRadius: '5px',
      boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
      padding: '15px',
      zIndex: 1000,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Resource Manager</h3>
        <button onClick={() => setExpanded(!expanded)} style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: '16px',
        }}>{expanded ? '✖' : '▼'}</button>
      </div>

      {expanded && (
        <div style={{ marginTop: '10px' }}>
          <h4>Resources</h4>
          {Object.entries(resources).map(([type, value]) => (
            <div key={type} style={{ marginBottom: '10px' }}>
              <p><strong>{type}:</strong> {value}</p>
              <button onClick={() => handleAdjustment(type, 10)} style={{
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '3px',
                padding: '5px 10px',
                marginRight: '5px',
                cursor: 'pointer',
              }}>+10</button>
              <button onClick={() => handleAdjustment(type, -10)} style={{
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '3px',
                padding: '5px 10px',
                cursor: 'pointer',
              }}>-10</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Features:
 * 1. **Resource Overview:**
 *    - Displays current levels of resources like bandwidth, energy, and storage.
 * 2. **Interactive Adjustments:**
 *    - Buttons to increase or decrease resources in configurable steps.
 * 3. **Expandable UI:**
 *    - Collapsible section to save space when not in use.
 * 4. **Real-time Updates:**
 *    - Notifies the parent component of changes in resource levels.
 */
