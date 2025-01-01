import React from "react";
import styled from "@emotion/styled";
import { Marker } from "./types";

interface MarkerContainerProps {
  $x: number;
  $y: number;
  $color?: string;
}

const MarkerContainer = styled.div<MarkerContainerProps>`
  position: absolute;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$color || props.theme.colors.secondary.main};
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translate(-50%, -50%) scale(1.2);
  }
`;

export interface MinimapMarkerProps {
  marker: Marker;
  onClick?: (marker: Marker) => void;
}

export const MinimapMarker: React.FC<MinimapMarkerProps> = ({
  marker,
  onClick,
}) => {
  return (
    <MarkerContainer
      $x={marker.x}
      $y={marker.y}
      $color={marker.color}
      onClick={() => onClick?.(marker)}
    />
  );
};
