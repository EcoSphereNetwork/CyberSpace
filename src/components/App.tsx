import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { NetworkScene } from '@/scenes/NetworkScene';
import { Overlay } from './ui/Overlay';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
`;

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<NetworkScene | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    sceneRef.current = new NetworkScene(containerRef.current);

    // Cleanup
    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
    };
  }, []);

  const handleReset = () => {
    // TODO: Implement reset view
    console.log('Reset view');
  };

  const handleToggleVR = () => {
    // TODO: Implement VR toggle
    console.log('Toggle VR');
  };

  return (
    <Container ref={containerRef}>
      <Overlay onReset={handleReset} onToggleVR={handleToggleVR} />
    </Container>
  );
};

export default App;