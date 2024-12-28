import React, { useRef, useState } from 'react';
import { NotificationSystem } from './NotificationSystem';
import { ChatModule } from './ChatModule';
import { CollaborativeScene } from './CollaborativeScene';
import { MultiUserSync } from './MultiUserSync';

export default function App() {
  const notificationRef = useRef();
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([
    { name: 'User1' },
    { name: 'User2' },
    { name: 'User3' },
  ]);

  const [sceneObjects, setSceneObjects] = useState([]);
  const [lockedNodes, setLockedNodes] = useState({});

  const handleChatMessage = (contactName, message) => {
    setMessages((prevMessages) => [...prevMessages, { user: contactName, message: message.message }]);
    notificationRef.current.addNotification({
      id: Date.now(),
      title: `New Message from ${contactName}`,
      message: message.message,
      type: 'success',
    });
  };

  const handleSceneUpdate = (updatedObject) => {
    setSceneObjects((prevObjects) => {
      const index = prevObjects.findIndex((obj) => obj.id === updatedObject.id);
      if (index !== -1) {
        const updated = [...prevObjects];
        updated[index] = updatedObject;
        return updated;
      }
      return [...prevObjects, updatedObject];
    });
  };

  const handleLockUpdate = (locks) => {
    setLockedNodes(locks);
    notificationRef.current.addNotification({
      id: Date.now(),
      title: 'Node Lock Updated',
      message: 'A node has been locked or unlocked.',
      type: 'info',
    });
  };

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      <NotificationSystem ref={notificationRef} notifications={[]} onClearNotification={(id) => {}} />

      <ChatModule
        messages={messages}
        contacts={contacts}
        onSendMessage={(contactName, message) => handleChatMessage(contactName, message)}
        onFileAttach={(file) => {
          notificationRef.current.addNotification({
            id: Date.now(),
            title: 'File Attached',
            message: `You attached a file: ${file.name}`,
            type: 'success',
          });
        }}
        onToolSelect={(tool) => {
          notificationRef.current.addNotification({
            id: Date.now(),
            title: 'Tool Selected',
            message: `You selected the tool: ${tool}`,
            type: 'info',
          });
        }}
      />

      <CollaborativeScene
        onObjectUpdate={handleSceneUpdate}
        onLockUpdate={handleLockUpdate}
        lockedNodes={lockedNodes}
      />
    </div>
  );
}
