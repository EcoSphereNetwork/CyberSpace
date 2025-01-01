import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

export const NotificationSystem = forwardRef(({ notifications, onClearNotification }, ref) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  const handleClear = (id) => {
    onClearNotification(id);
    setVisibleNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  useImperativeHandle(ref, () => ({
    addNotification: (notification) => {
      setVisibleNotifications((prev) => [...prev, notification]);
    },
  }));

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      width: '300px',
      backgroundColor: '#f9f9f9',
      border: '1px solid #ccc',
      borderRadius: '5px',
      boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
      zIndex: 1000,
    }}>
      <div style={{ padding: '10px', borderBottom: '1px solid #ccc', fontWeight: 'bold' }}>Notifications</div>
      <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '10px' }}>
        {visibleNotifications.length > 0 ? (
          visibleNotifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                marginBottom: '10px',
                padding: '10px',
                backgroundColor: notification.type === 'error' ? '#f8d7da' : '#d4edda',
                borderLeft: `5px solid ${notification.type === 'error' ? '#dc3545' : '#28a745'}`,
                borderRadius: '3px',
              }}
            >
              <p style={{ margin: 0 }}><strong>{notification.title}</strong></p>
              <p style={{ margin: '5px 0' }}>{notification.message}</p>
              <button
                onClick={() => handleClear(notification.id)}
                style={{
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
              >
                Dismiss
              </button>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#6c757d' }}>No notifications</p>
        )}
      </div>
    </div>
  );
});

/**
 * Features:
 * 1. **Notification Display:**
 *    - Displays real-time feedback messages for lock and chat events.
 * 2. **Categorized Notifications:**
 *    - Notifications styled based on type (success or error).
 * 3. **Dismiss Functionality:**
 *    - Users can clear individual notifications.
 * 4. **Scrollable List:**
 *    - Handles multiple notifications with a scrollable interface.
 * 5. **Add Notification:**
 *    - Allows integration with other modules to push notifications dynamically.
 * 6. **Forward Ref Integration:**
 *    - Provides external modules access to add notifications via `addNotification`.
 * 7. **Integration Points:**
 *    - Connected with `MultiUserSync` and `ChatModule` for real-time events and feedback.
 */


// graph_controller.js

document.addEventListener('DOMContentLoaded', () => {
    const layoutSelect = document.getElementById('layout-select');
    const zoomSlider = document.getElementById('zoom-slider');
    const transparencyCheckbox = document.getElementById('transparency-checkbox');
    const filterDropdown = document.getElementById('filter-dropdown');
  
    // Event listener for layout changes
    layoutSelect.addEventListener('change', (e) => {
      console.log(`Layout geändert zu: ${e.target.value}`);
      // Implement layout switching logic here
    });
  
    // Zoom functionality
    zoomSlider.addEventListener('input', (e) => {
      const scale = e.target.value;
      const graph = document.getElementById('graph-visualization');
      graph.style.transform = `scale(${scale})`;
    });
  
    // Transparency toggle
    transparencyCheckbox.addEventListener('change', (e) => {
      const isTransparent = e.target.checked;
      const graphElements = document.querySelectorAll('#graph-visualization *');
      graphElements.forEach((element) => {
        element.style.opacity = isTransparent ? '0.5' : '1';
      });
    });
  
    // Filter dropdown functionality
    filterDropdown.addEventListener('change', (e) => {
      const selectedFilter = e.target.value;
      console.log(`Filter angewendet: ${selectedFilter}`);
      // Implement filtering logic
      if (selectedFilter === 'critical') {
        highlightCriticalConnections();
      } else if (selectedFilter === 'active-nodes') {
        showActiveNodesOnly();
      } else {
        resetFilters();
      }
    });
  
    function highlightCriticalConnections() {
      console.log('Zeige kritische Verbindungen');
      // Logic to highlight critical connections
    }
  
    function showActiveNodesOnly() {
      console.log('Zeige nur aktive Nodes');
      // Logic to show active nodes
    }
  
    function resetFilters() {
      console.log('Filter zurückgesetzt');
      // Logic to reset all filters
    }
  
    // Add interactive analysis capabilities
    document.getElementById('analyze-graph-btn').addEventListener('click', () => {
      console.log('Graphanalyse gestartet');
      performGraphAnalysis();
    });
  
    function performGraphAnalysis() {
      console.log('Führe Analyse durch');
      // Example logic for graph analysis
      const nodeCount = document.querySelectorAll('#graph-visualization .node').length;
      const connectionCount = document.querySelectorAll('#graph-visualization .connection').length;
      console.log(`Nodes: ${nodeCount}, Verbindungen: ${connectionCount}`);
    }
  });
  