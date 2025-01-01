import React, { useRef, useEffect } from "react";
import styled from "@emotion/styled";
import { ExampleScene } from "./ExampleScenes";
import { SceneManager } from "@/core/SceneManager";

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

export interface ExampleAppProps {
  onSceneLoaded?: (scene: ExampleScene) => void;
  onTransitionStart?: (transition: any) => void;
  onTransitionComplete?: () => void;
}

export const ExampleApp: React.FC<ExampleAppProps> = ({
  onSceneLoaded,
  onTransitionStart,
  onTransitionComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<SceneManager | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const manager = new SceneManager({
      container: containerRef.current,
      autoStart: true,
    });

    managerRef.current = manager;

    manager.on("sceneLoaded", (scene: ExampleScene) => {
      onSceneLoaded?.(scene);
    });

    manager.on("transitionStart", (transition: any) => {
      onTransitionStart?.(transition);
    });

    manager.on("transitionComplete", () => {
      onTransitionComplete?.();
    });

    return () => {
      manager.dispose();
    };
  }, [onSceneLoaded, onTransitionStart, onTransitionComplete]);

  return <Container ref={containerRef} />;
};
