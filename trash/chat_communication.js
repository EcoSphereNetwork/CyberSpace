import React, { useState, useEffect } from 'react';

export function ChatCommunicationModule({ socket, onMessageReceive, notificationRef }) {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Listen for incoming messages
    socket.on('chat_message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      if (onMessageReceive) onMessageReceive(message);

      if (notificationRef && notificationRef.current) {
        notificationRef.current.addNotification({
          id: Date.now(),
          title: `New Message from ${message.user}`,
          message: message.content,
          type: 'info',
        });
      }
    });

    // Update online users
    socket.on('user_status_update', (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off('chat_message');
      socket.off('user_status_update');
    };
  }, [socket, onMessageReceive, notificationRef]);

  const sendMessage = (message) => {
    const newMessage = { user: socket.id, content: message, timestamp: Date.now() };
    socket.emit('chat_message', newMessage);
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  return (
    <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '300px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0,0,0,0.1)', zIndex: 1000 }}>
      <div style={{ padding: '10px', borderBottom: '1px solid #ccc', fontWeight: 'bold' }}>Chat</div>
      <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            <strong>{msg.user}:</strong> {msg.content} <small style={{ color: '#6c757d' }}>({new Date(msg.timestamp).toLocaleTimeString()})</small>
          </div>
        ))}
      </div>
      <div style={{ padding: '10px', borderTop: '1px solid #ccc' }}>
        <input
          type="text"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
              sendMessage(e.target.value);
              e.target.value = '';
            }
          }}
          placeholder="Type a message..."
          style={{ width: 'calc(100% - 20px)', padding: '5px', border: '1px solid #ccc', borderRadius: '3px' }}
        />
      </div>
      <div style={{ padding: '10px', borderTop: '1px solid #ccc', fontSize: '12px' }}>
        <strong>Online Users:</strong>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {users.map((user, index) => (
            <li key={index} style={{ color: '#007bff' }}>{user}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Features:
 * 1. **Real-time Messaging:**
 *    - Users can send and receive messages instantly.
 * 2. **Online User List:**
 *    - Displays the list of users currently online.
 * 3. **Message History:**
 *    - Shows chat history with timestamps.
 * 4. **Keyboard Shortcut:**
 *    - Press Enter to send a message quickly.
 * 5. **Notification Integration:**
 *    - Adds new messages as notifications using the notification system.
 */
