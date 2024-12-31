import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { EarthScene } from '@/scenes/EarthScene';
import { Overlay } from './ui/Overlay';
import { LoadingScreen } from './ui/LoadingScreen';
import { ErrorScreen } from './ui/ErrorScreen';
import { DebugOverlay } from './ui/DebugOverlay';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
`;

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<EarthScene | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const loadingManager = LoadingManager.getInstance();
    loadingManager.reset();

    // Add loading items
    loadingManager.addItem('scene');
    loadingManager.addItem('textures');
    loadingManager.addItem('models');
    loadingManager.addItem('network');

    try {
      // Initialize scene
      loadingManager.setCurrentItem('scene');
      sceneRef.current = new EarthScene(containerRef.current);

      // Simulate loading textures
      loadingManager.setCurrentItem('textures');
      setTimeout(() => {
        loadingManager.completeItem('textures');
        
        // Simulate loading models
        loadingManager.setCurrentItem('models');
        setTimeout(() => {
          loadingManager.completeItem('models');

          // Simulate loading network
          loadingManager.setCurrentItem('network');
          setTimeout(() => {
            loadingManager.completeItem('network');
            loadingManager.completeItem('scene');
            setIsLoading(false);
          }, 1000);
        }, 1000);
      }, 1000);
    } catch (err) {
      console.error('Failed to initialize scene:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize scene');
    }

    // Cleanup
    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
      loadingManager.reset();
    };
  }, []);

  const handleReset = () => {
    if (sceneRef.current) {
      sceneRef.current.resetCamera();
    }
  };

  const handleToggleVR = () => {
    if (sceneRef.current) {
      sceneRef.current.toggleVR();
    }
  };

  if (error) {
    return <ErrorScreen message={error} />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Container ref={containerRef}>
      <Overlay onReset={handleReset} onToggleVR={handleToggleVR} />
      <DebugOverlay />
    </Container>
  );
};

export default App;
