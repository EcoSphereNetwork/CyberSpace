// realtime_data_communication.js

/**
 * Real-Time Data Communication: Establishes WebSocket connections to provide live updates for the application.
 * This module supports subscribing to specific topics and broadcasting updates in real-time.
 */

const WEBSOCKET_URL = 'wss://example.com/realtime'; // Update with your WebSocket server URL
let socket;

/**
 * Initializes the WebSocket connection.
 * @param {Function} onMessage - Callback to handle incoming messages.
 */
export function initializeWebSocket(onMessage) {
  socket = new WebSocket(WEBSOCKET_URL);

  socket.onopen = () => {
    console.log('WebSocket connection established.');
    // Subscribe to default topics
    sendWebSocketMessage({ type: 'subscribe', topic: 'default' });
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('WebSocket message received:', data);
    if (typeof onMessage === 'function') {
      onMessage(data);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed. Attempting to reconnect...');
    setTimeout(() => initializeWebSocket(onMessage), 5000); // Reconnect after 5 seconds
  };
}

/**
 * Sends a message through the WebSocket connection.
 * @param {Object} message - The message to send.
 */
export function sendWebSocketMessage(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
    console.log('WebSocket message sent:', message);
  } else {
    console.warn('WebSocket is not open. Message not sent:', message);
  }
}

/** Example Usage */
initializeWebSocket((data) => {
  if (data.type === 'update') {
    console.log('Real-time update received:', data.payload);
    // Handle the update (e.g., update the UI)
  } else if (data.type === 'alert') {
    console.log('Alert received:', data.payload);
    // Show alert in the Notification System
  }
});

// Example of sending a message
setTimeout(() => {
  sendWebSocketMessage({ type: 'subscribe', topic: 'metrics' });
}, 2000);
