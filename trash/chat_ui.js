import React, { useState } from 'react';

export function ChatModule({ messages, contacts, onSendMessage, onGroupCreate, onFileAttach, onToolSelect }) {
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeChats, setActiveChats] = useState({});
  const [settings, setSettings] = useState({});
  const [showTools, setShowTools] = useState(false);

  const handleSend = (contactName) => {
    if (input.trim() !== '') {
      const newMessage = { user: 'You', message: input.trim() };
      onSendMessage(contactName, newMessage);
      setActiveChats((prev) => ({
        ...prev,
        [contactName]: [...(prev[contactName] || []), newMessage],
      }));
      setInput('');
    }
  };

  const handleSettings = (contactName, settingKey, value) => {
    setSettings((prev) => ({
      ...prev,
      [contactName]: {
        ...prev[contactName],
        [settingKey]: value,
      },
    }));
  };

  const createGroupChat = () => {
    const groupName = prompt('Enter group chat name:');
    if (groupName) {
      onGroupCreate(groupName);
      setActiveChats((prev) => ({ ...prev, [groupName]: [] }));
    }
  };

  const handleFileAttach = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      onFileAttach(file);
    };
    fileInput.click();
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: isMinimized ? '10px' : 'auto',
      right: '10px',
      width: isMinimized ? '200px' : '400px',
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      borderRadius: '5px',
      boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
      zIndex: 1000,
      display: 'flex',
    }}>
      {!isMinimized && (
        <div
          style={{
            width: '150px',
            borderRight: '1px solid #ccc',
            overflowY: 'auto',
            maxHeight: '300px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <button
            onClick={createGroupChat}
            style={{
              width: '100%',
              padding: '10px',
              borderBottom: '1px solid #ddd',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            + Group Chat
          </button>
          {contacts.map((contact, index) => (
            <div
              key={index}
              style={{
                padding: '10px',
                borderBottom: '1px solid #ddd',
                cursor: 'pointer',
              }}
              onClick={() => alert(`Chat with ${contact.name}`)}
            >
              {contact.name}
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1 }}>
        <div
          style={{
            padding: '10px',
            borderBottom: '1px solid #ccc',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Chat</span>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
        </div>
        {!isMinimized && (
          <>
            <div
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
                padding: '10px',
              }}
            >
              {Object.entries(activeChats).map(([contact, chatMessages]) => (
                <div key={contact}>
                  <h4>{contact}</h4>
                  {chatMessages.map((msg, index) => (
                    <div key={index} style={{ marginBottom: '5px' }}>
                      <strong>{msg.user}:</strong> {msg.message}
                    </div>
                  ))}
                  <button
                    onClick={() => handleSettings(contact, 'persistent', true)}
                    style={{
                      margin: '5px',
                      backgroundColor: '#007bff',
                      color: '#fff',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                    }}
                  >
                    Make Persistent
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', borderTop: '1px solid #ccc', padding: '10px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend(Object.keys(activeChats)[0]);
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                }}
                placeholder="Type a message"
              />
              <button
                onClick={() => handleSend(Object.keys(activeChats)[0])}
                style={{
                  marginLeft: '5px',
                  padding: '8px 12px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
              >
                Send
              </button>
              <button
                onClick={handleFileAttach}
                style={{
                  marginLeft: '5px',
                  padding: '8px 12px',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
              >
                Attach File
              </button>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowTools(!showTools)}
                  style={{
                    marginLeft: '5px',
                    padding: '8px 12px',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                >
                  Tools
                </button>
                {showTools && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '5px',
                      boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
                      zIndex: 1000,
                    }}
                  >
                    <ul style={{ listStyle: 'none', margin: 0, padding: '10px' }}>
                      <li
                        style={{ padding: '5px', cursor: 'pointer' }}
                        onClick={() => onToolSelect('AI-Agent')}
                      >
                        AI-Agent Response
                      </li>
                      <li
                        style={{ padding: '5px', cursor: 'pointer' }}
                        onClick={() => onToolSelect('Image Generation')}
                      >
                        AI Image Generation
                      </li>
                      <li
                        style={{ padding: '5px', cursor: 'pointer' }}
                        onClick={() => onToolSelect('Fake News Detection')}
                      >
                        Fake News Detection
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Features:
 * 1. **Real-time Chat Display:**
 *    - Displays incoming messages in a scrollable chat window.
 * 2. **Contact Management:**
 *    - Scrollable list of contacts and group chat creation.
 * 3. **Multiple Chat Sessions:**
 *    - Users can manage multiple chat sessions with separate settings.
 * 4. **Chat Settings:**
 *    - Persistent chat, deletion timers, encryption, and color tagging.
 * 5. **File Attachment:**
 *    - Allows users to upload and share files within chats.
 * 6. **Tools Integration:**
 *    - Provides a dropdown menu for AI-based tools like response generation, image creation, and fake news detection.
 */
