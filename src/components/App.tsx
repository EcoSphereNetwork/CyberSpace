import React, { useState, Suspense } from 'react';
import styled from '@emotion/styled';
import { Canvas } from '@react-three/fiber';
import { LoadingScreen } from './ui/LoadingScreen';
import { ErrorScreen } from './ui/ErrorScreen';
import { DebugOverlay } from './ui/DebugOverlay';
import { EarthScene } from '@/scenes/EarthScene';
import { NetworkScene } from '@/scenes/NetworkScene';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
`;

const SceneSelector = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 100;
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &.active {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeScene, setActiveScene] = useState<'earth' | 'network'>('earth');

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = (error: Error) => {
    console.error('Failed to load scene:', error);
    setError(error.message);
  };

  const handleReset = () => {
    // Reset camera handled by OrbitControls
  };

  const handleVR = () => {
    // TODO: Implement VR mode
    console.log('VR mode not implemented yet');
  };

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <>
      <Container>
        <Canvas>
          <Suspense fallback={null}>
            {activeScene === 'earth' ? (
              <EarthScene onLoad={handleLoad} onError={handleError} />
            ) : (
              <NetworkScene onLoad={handleLoad} onError={handleError} />
            )}
          </Suspense>
        </Canvas>
      </Container>

      <SceneSelector>
        <Button
          className={activeScene === 'earth' ? 'active' : ''}
          onClick={() => setActiveScene('earth')}
        >
          Earth View
        </Button>
        <Button
          className={activeScene === 'network' ? 'active' : ''}
          onClick={() => setActiveScene('network')}
        >
          Network View
        </Button>
      </SceneSelector>

      {isLoading && <LoadingScreen />}
      <DebugOverlay onReset={handleReset} onVR={handleVR} />
    </>
  );
};

export default App;
