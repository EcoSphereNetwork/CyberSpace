import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ErrorScreen } from '@/components/ui/ErrorScreen';
import { NetworkScene } from '@/scenes/NetworkScene';
import { EarthScene } from '@/scenes/EarthScene';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeScene, setActiveScene] = useState<'earth' | 'network'>('network');

  const handleSceneLoad = () => {
    setIsLoading(false);
  };

  const handleSceneError = (error: Error) => {
    setError(error.message);
  };

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <>
      {activeScene === 'network' ? (
        <NetworkScene onLoad={handleSceneLoad} onError={handleSceneError} />
      ) : (
        <Canvas>
          <Suspense fallback={null}>
            <EarthScene onLoad={handleSceneLoad} onError={handleSceneError} />
          </Suspense>
        </Canvas>
      )}

      {isLoading && <LoadingScreen />}

      <div style={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 100,
      }}>
        <button
          onClick={() => setActiveScene(activeScene === 'earth' ? 'network' : 'earth')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#00cc66',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Switch to {activeScene === 'earth' ? 'Network' : 'Earth'} View
        </button>
      </div>
    </>
  );
};

export default App;
