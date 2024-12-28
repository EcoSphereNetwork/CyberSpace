import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SERVER_URL = 'http://localhost:3000'; // Replace with your server address

export function MultiUserSync({ onUserUpdate, onObjectUpdate, onCharacterItemInteraction, onUserPreferencesUpdate, onGroupUpdate, onRoleAction, onCollaborativeAction, onHistoryUpdate, onChatMessage }) {
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [objects, setObjects] = useState([]);
  const [userPreferences, setUserPreferences] = useState({});
  const [groups, setGroups] = useState([]);
  const [history, setHistory] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      transports: ['websocket'],
    });
    setSocket(newSocket);

    // Handle new user connections
    newSocket.on('user_connected', (user) => {
      setUsers((prevUsers) => [...prevUsers, user]);
      if (onUserUpdate) onUserUpdate(user, 'connected');
    });

    // Handle user disconnections
    newSocket.on('user_disconnected', (userId) => {
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
      if (onUserUpdate) onUserUpdate(userId, 'disconnected');
    });

    // Handle object updates
    newSocket.on('object_update', (updatedObject) => {
      setObjects((prevObjects) => {
        const index = prevObjects.findIndex((o) => o.id === updatedObject.id);
        if (index !== -1) {
          const updatedObjects = [...prevObjects];
          updatedObjects[index] = updatedObject;
          return updatedObjects;
        }
        return [...prevObjects, updatedObject];
      });
      if (onObjectUpdate) onObjectUpdate(updatedObject);
    });

    // Handle bulk object synchronization
    newSocket.on('bulk_object_update', (updatedObjects) => {
      setObjects((prevObjects) => {
        const objectMap = new Map(prevObjects.map((obj) => [obj.id, obj]));
        updatedObjects.forEach((obj) => objectMap.set(obj.id, obj));
        return Array.from(objectMap.values());
      });
    });

    // Handle character-item interactions
    newSocket.on('character_item_interaction', ({ characterId, itemId, action }) => {
      if (onCharacterItemInteraction) {
        onCharacterItemInteraction(characterId, itemId, action);
      }
    });

    // Handle user preferences updates
    newSocket.on('user_preferences_update', (updatedPreferences) => {
      setUserPreferences((prevPreferences) => ({ ...prevPreferences, ...updatedPreferences }));
      if (onUserPreferencesUpdate) onUserPreferencesUpdate(updatedPreferences);
    });

    // Handle group updates
    newSocket.on('group_update', (updatedGroups) => {
      setGroups(updatedGroups);
      if (onGroupUpdate) onGroupUpdate(updatedGroups);
    });

    // Handle role-based actions
    newSocket.on('role_action', ({ roleId, action, target }) => {
      if (onRoleAction) onRoleAction(roleId, action, target);
    });

    // Handle collaborative actions
    newSocket.on('collaborative_action', ({ userId, action, target }) => {
      if (onCollaborativeAction) onCollaborativeAction(userId, action, target);
    });

    // Handle historical data updates
    newSocket.on('history_update', (newHistory) => {
      setHistory((prevHistory) => [...prevHistory, ...newHistory]);
      if (onHistoryUpdate) onHistoryUpdate(newHistory);
    });

    // Handle chat messages
    newSocket.on('chat_message', (message) => {
      setChatMessages((prevMessages) => [...prevMessages, message]);
      if (onChatMessage) onChatMessage(message);
    });

    return () => newSocket.close();
  }, [onUserUpdate, onObjectUpdate, onCharacterItemInteraction, onUserPreferencesUpdate, onGroupUpdate, onRoleAction, onCollaborativeAction, onHistoryUpdate, onChatMessage]);

  const updateObject = (object) => {
    if (socket) {
      socket.emit('update_object', object);
    }
  };

  const sendBulkUpdate = (objects) => {
    if (socket) {
      const compressed = JSON.stringify(objects);
      socket.emit('bulk_object_update', compressed);
    }
  };

  const characterInteractsWithItem = (characterId, itemId, action) => {
    if (socket) {
      socket.emit('character_item_interaction', { characterId, itemId, action });
    }
  };

  const updateUserPreferences = (preferences) => {
    if (socket) {
      socket.emit('user_preferences_update', preferences);
    }
  };

  const updateGroups = (groups) => {
    if (socket) {
      socket.emit('group_update', groups);
    }
  };

  const sendRoleAction = (roleId, action, target) => {
    if (socket) {
      socket.emit('role_action', { roleId, action, target });
    }
  };

  const sendCollaborativeAction = (userId, action, target) => {
    if (socket) {
      socket.emit('collaborative_action', { userId, action, target });
    }
  };

  const requestHistory = () => {
    if (socket) {
      socket.emit('request_history');
    }
  };

  const sendChatMessage = (message) => {
    if (socket) {
      socket.emit('chat_message', message);
    }
  };

  return {
    users,
    objects,
    userPreferences,
    groups,
    history,
    chatMessages,
    updateObject,
    sendBulkUpdate,
    characterInteractsWithItem,
    updateUserPreferences,
    updateGroups,
    sendRoleAction,
    sendCollaborativeAction,
    requestHistory,
    sendChatMessage,
  };
}

/**
 * Chat Integration:
 * 1. **Real-time Chat Messages:**
 *    - Synchronizes chat messages between all connected users.
 * 2. **Chat Message Handling:**
 *    - Processes and displays chat messages via WebSocket.
 * 3. **Historical Data Integration:**
 *    - Synchronizes historical changes to objects and users.
 * 4. **Collaboration Tools:**
 *    - Supports real-time collaborative actions and chat functionality.
 */
