import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { SceneManager } from '../SceneManager';
import { ExampleScenes } from './ExampleScenes';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #000;
`;

const Canvas = styled.div`
  width: 100%;
  height: 100%;
`;

const Controls = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  z-index: 1000;
`;

const Button = styled.button<{ active?: boolean }>`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: ${(props) => (props.active ? '#00ff00' : '#333')};
  color: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.active ? '#00cc00' : '#444')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Status = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 4px;
  color: white;
  font-family: monospace;
  z-index: 1000;
`;

export const ExampleApp: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<SceneManager | null>(null);
  const [activeScene, setActiveScene] = useState<string>('default');
  const [transitioning, setTransitioning] = useState(false);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene manager
    managerRef.current = new SceneManager({
      container: containerRef.current,
      defaultScene: 'default',
      scenes: ExampleScenes,
      autoStart: true,
    });

    // Listen for events
    managerRef.current.on('sceneLoaded', (scene) => {
      setActiveScene(scene.id);
      setStatus(`Loaded scene: ${scene.id}`);
    });

    managerRef.current.on('transitionStart', (transition) => {
      setTransitioning(true);
      setStatus(`Transitioning: ${transition.from} -> ${transition.to}`);
    });

    managerRef.current.on('transitionComplete', () => {
      setTransitioning(false);
      setStatus('Transition complete');
    });

    return () => {
      managerRef.current?.dispose();
    };
  }, []);

  const handleSceneChange = async (sceneId: string) => {
    if (!managerRef.current || transitioning || activeScene === sceneId) return;

    try {
      await managerRef.current.transitionToScene({
        from: activeScene,
        to: sceneId,
        duration: 2,
        type: 'fade',
      });
    } catch (error) {
      console.error('Failed to transition:', error);
      setStatus('Transition failed');
    }
  };

  const scenes = [
    { id: 'default', label: 'Default' },
    { id: 'dataViz', label: 'Data Visualization' },
    { id: 'vrWorld', label: 'VR World' },
    { id: 'night', label: 'Night' },
    { id: 'storm', label: 'Storm' },
  ];

  return (
    <Container>
      <Canvas ref={containerRef} />

      <Controls>
        {scenes.map((scene) => (
          <Button
            key={scene.id}
            active={activeScene === scene.id}
            disabled={transitioning}
            onClick={() => handleSceneChange(scene.id)}
          >
            {scene.label}
          </Button>
        ))}
      </Controls>

      <Status>{status}</Status>
    </Container>
  );
};
