import React from 'react';
import styled from '@emotion/styled';

const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 100;
`;

const TopBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  padding: 0 20px;
  pointer-events: auto;
`;

const Title = styled.h1`
  color: white;
  margin: 0;
  font-size: 24px;
  font-weight: 500;
`;

const Controls = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  padding: 10px 20px;
  border-radius: 8px;
  display: flex;
  gap: 10px;
  pointer-events: auto;
`;

const Button = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

interface OverlayProps {
  onReset?: () => void;
  onToggleVR?: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ onReset, onToggleVR }) => {
  return (
    <OverlayContainer>
      <TopBar>
        <Title>CyberSpace</Title>
      </TopBar>
      <Controls>
        <Button onClick={onReset}>Reset View</Button>
        <Button onClick={onToggleVR}>Toggle VR</Button>
      </Controls>
    </OverlayContainer>
  );
};