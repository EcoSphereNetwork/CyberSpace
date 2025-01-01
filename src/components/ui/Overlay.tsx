import React from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
`;

const Button = styled.button`
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: background 0.2s;
  pointer-events: auto;

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
    <Container>
      <Button onClick={onReset}>Reset</Button>
      <Button onClick={onToggleVR}>Toggle VR</Button>
    </Container>
  );
};
