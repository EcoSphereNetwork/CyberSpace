import React, { useRef, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { LoadingScreen } from './ui/LoadingScreen';
import { ErrorScreen } from './ui/ErrorScreen';
import { DebugOverlay } from './ui/DebugOverlay';
import { SceneManager } from '@/core/SceneManager';
import { LayerManager } from '@/core/LayerManager';
import { ResourceManager } from '@/core/ResourceManager';
import { LoadingManager } from '@/core/LoadingManager';
import { OptimizationManager } from '@/core/OptimizationManager';
import { TransitionManager } from '@/core/TransitionManager';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
`;

export const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const loadingManager = LoadingManager.getInstance();
    const sceneManager = SceneManager.getInstance();
    const layerManager = LayerManager.getInstance();
    const resourceManager = ResourceManager.getInstance();
    const optimizationManager = OptimizationManager.getInstance();
    const transitionManager = TransitionManager.getInstance();

    // Reset loading state
    loadingManager.reset();

    // Initialize core resources
    const coreResources = [
      { url: '/textures/earth.jpg', type: 'texture' as const },
      { url: '/textures/clouds.jpg', type: 'texture' as const },
      { url: '/textures/stars.jpg', type: 'texture' as const },
      { url: '/models/node.glb', type: 'model' as const },
      { url: '/data/network.json', type: 'json' as const },
    ];

    // Add loading items
    loadingManager.addItem('core');
    loadingManager.addItem('scenes');
    loadingManager.addItem('layers');

    const initializeApp = async () => {
      try {
        // Load core resources
        loadingManager.setCurrentItem('Loading core resources...');
        await resourceManager.preload(coreResources);
        loadingManager.completeItem('core');

        // Initialize scene manager
        loadingManager.setCurrentItem('Initializing scenes...');
        sceneManager.initialize(containerRef.current);
        await sceneManager.loadScene('earth');
        loadingManager.completeItem('scenes');

        // Initialize layers
        loadingManager.setCurrentItem('Initializing layers...');
        const scene = sceneManager.getActiveScene();
        if (scene) {
          layerManager.initialize(scene);
          await layerManager.loadLayers(['network', 'data', 'ui']);
        }
        loadingManager.completeItem('layers');

        // Initialize optimization
        const renderer = scene?.renderer;
        if (renderer) {
          optimizationManager.initialize(renderer);
          transitionManager.initialize(renderer);
        }

        // Complete loading
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize application');
      }
    };

    // Start initialization
    initializeApp().catch((err) => {
      console.error('Failed to initialize app:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize application');
    });

    // Cleanup
    return () => {
      sceneManager.dispose();
      layerManager.dispose();
      resourceManager.dispose();
      optimizationManager.dispose();
      transitionManager.dispose();
      loadingManager.reset();
    };
  }, []);

  const handleReset = () => {
    const scene = SceneManager.getInstance().getActiveScene();
    if (scene) {
      scene.resetCamera();
    }
  };

  const handleVR = () => {
    const scene = SceneManager.getInstance().getActiveScene();
    if (scene) {
      scene.toggleVR();
    }
  };

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Container ref={containerRef} />
      <DebugOverlay onReset={handleReset} onVR={handleVR} />
    </>
  );
};
