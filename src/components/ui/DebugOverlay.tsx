import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';

const DebugContainer = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  color: #fff;
  z-index: 1000;
`;

const DebugItem = styled.div`
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
  gap: 20px;
`;

interface Stats {
  fps: number;
  memory: number;
  objects: number;
  drawCalls: number;
  triangles: number;
}

export const DebugOverlay: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    fps: 0,
    memory: 0,
    objects: 0,
    drawCalls: 0,
    triangles: 0,
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const updateStats = () => {
      const now = performance.now();
      const delta = now - lastTime;

      if (delta >= 1000) {
        setStats((prev) => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / delta),
          memory: (performance as any).memory?.usedJSHeapSize || 0,
        }));

        frameCount = 0;
        lastTime = now;
      }

      frameCount++;
      animationFrameId = requestAnimationFrame(updateStats);
    };

    updateStats();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <DebugContainer>
      <DebugItem>FPS: {stats.fps}</DebugItem>
      <DebugItem>Memory: {(stats.memory / 1024 / 1024).toFixed(2)} MB</DebugItem>
      <DebugItem>Objects: {stats.objects}</DebugItem>
      <DebugItem>Draw Calls: {stats.drawCalls}</DebugItem>
      <DebugItem>Triangles: {stats.triangles}</DebugItem>
    </DebugContainer>
  );
};