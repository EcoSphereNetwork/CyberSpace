import React, { useState } from 'react';
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

export const App: React.FC = () => {
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

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Container>
        <Canvas>
          {activeScene === 'earth' ? (
            <EarthScene onLoad={handleLoad} onError={handleError} />
          ) : (
            <NetworkScene onLoad={handleLoad} onError={handleError} />
          )}
        </Canvas>
      </Container>
      <DebugOverlay onReset={handleReset} onVR={handleVR} />
    </>
  );
};
