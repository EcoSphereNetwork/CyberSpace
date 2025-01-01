// Converted to TypeScript with JSX
import React from 'react';
// CyberSpace Communication System

import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://cyberspace-server.example.com');

export export function CommunicationSystem() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('Anonymous');
  const [audioStream, setAudioStream] = useState(null);
  const [videoStream, setVideoStream] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    // Listen for incoming messages
    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('voice', (data) => {
      const audio = new Audio(data.blob);
      audio.play();
    });

    socket.on('video-offer', (offer) => {
      handleVideoOffer(offer);
    });

    return () => {
      socket.off('message');
      socket.off('voice');
      socket.off('video-offer');
    };
  }, []);

  const sendMessage = () => {
    if (inputMessage.trim() === '') return;
    const message = {
      username,
      text: inputMessage,
      timestamp: new Date().toISOString(),
    };

    socket.emit('message', message);
    setMessages((prevMessages) => [...prevMessages, message]);
    setInputMessage('');
  };

  const startAudioStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      const audioContext = new AudioContext();
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        socket.emit('voice', { blob: event.data });
      };
      mediaRecorder.start(1000); // Send chunks every second
    } catch (error) {
      console.error('Error accessing audio stream:', error);
    }
  };

  const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      socket.emit('video-offer', { sdp: stream });
    } catch (error) {
      console.error('Error accessing video stream:', error);
    }
  };

  const handleVideoOffer = (offer) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = offer.sdp;
    }
  };

  return (
    <div className="communication-system">
      <h2>CyberSpace Chat</h2>

      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <span className="username">{msg.username}</span>:
            <span className="text">{msg.text}</span>
            <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Enter your message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      <div className="username-settings">
        <label>Your Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="voice-video-controls">
        <button onClick={startAudioStream}>Start Voice</button>
        <button onClick={startVideoStream}>Start Video</button>
      </div>

      <div className="video-section">
        <video ref={localVideoRef} autoPlay muted></video>
        <video ref={remoteVideoRef} autoPlay></video>
      </div>
    </div>
  );
}
