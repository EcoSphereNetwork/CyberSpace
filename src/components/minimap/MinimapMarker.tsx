import React from "react";
import styled from "@emotion/styled";
import { Tooltip } from "@/components/ui/Tooltip";
import { Icon } from "@/components/ui/Icon";
import { Marker } from "./types";

const MarkerContainer = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${props => props.x * 100}%;
  top: ${props => props.y * 100}%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translate(-50%, -50%) scale(1.2);
  }
`;

const MarkerIcon = styled(Icon)<{ color?: string }>`
  color: ${props => props.color || props.theme.colors.secondary.main};
  width: 24px;
  height: 24px;
`;

const MarkerLabel = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 4px;
  padding: 2px 6px;
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.primary};
  font-size: 0.75rem;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: ${props => props.theme.shadows[1]};
`;

interface MinimapMarkerProps {
  marker: Marker;
  onClick?: (marker: Marker) => void;
}

export const MinimapMarker: React.FC<MinimapMarkerProps> = ({
  marker,
  onClick,
}) => {
  const handleClick = () => {
    onClick?.(marker);
  };

  return (
    <Tooltip content={marker.tooltip || marker.label}>
      <MarkerContainer x={marker.x} y={marker.y} onClick={handleClick}>
        <MarkerIcon
          name={marker.icon || "location"}
          color={marker.color}
        />
        {marker.label && <MarkerLabel>{marker.label}</MarkerLabel>}
      </MarkerContainer>
    </Tooltip>
  );
};
