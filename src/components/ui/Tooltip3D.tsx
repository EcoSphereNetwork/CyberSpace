import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import styled from '@emotion/styled';

const TooltipContainer = styled.div<{ $visible: boolean }>`
  position: relative;
  padding: 8px 12px;
  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.divider};
  border-radius: 4px;
  color: ${props => props.theme.colors.text.primary};
  font-size: 0.875rem;
  pointer-events: none;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 200px;
  z-index: 1000;

  &::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: ${props => props.theme.colors.divider};
  }

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: ${props => props.theme.colors.background.paper};
  }
`;

interface Tooltip3DProps {
  content: React.ReactNode;
  visible: boolean;
  position?: [number, number, number];
  offset?: [number, number];
  children?: React.ReactNode;
}

export const Tooltip3D: React.FC<Tooltip3DProps> = ({
  content,
  visible,
  position = [0, 0, 0],
  offset = [0, 30],
  children,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { camera, size } = useThree();

  useEffect(() => {
    if (tooltipRef.current && visible) {
      const vector = camera.position.clone();
      vector.project(camera);
      
      const x = (vector.x * 0.5 + 0.5) * size.width;
      const y = (vector.y * -0.5 + 0.5) * size.height;
      
      tooltipRef.current.style.transform = `translate(${x + offset[0]}px, ${y + offset[1]}px)`;
    }
  }, [camera.position, size, visible, offset]);

  return (
    <group position={position}>
      {children}
      <Html>
        <TooltipContainer ref={tooltipRef} $visible={visible}>
          {content}
        </TooltipContainer>
      </Html>
    </group>
  );
};