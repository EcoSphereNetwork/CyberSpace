import React from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
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
`;

interface DebugOverlayProps {
  onReset?: () => void;
  onVR?: () => void;
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({ onReset, onVR }) => {
  return (
    <Container>
      <Button onClick={onReset}>Reset</Button>
      <Button onClick={onVR}>VR</Button>
    </Container>
  );
};
