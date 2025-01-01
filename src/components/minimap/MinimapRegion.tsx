import React from "react";
import styled from "@emotion/styled";
import { Tooltip } from "@/components/ui/Tooltip";
import { Region } from "./types";

const RegionContainer = styled.div<{
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}>`
  position: absolute;
  left: ${props => props.x * 100}%;
  top: ${props => props.y * 100}%;
  width: ${props => props.width * 100}%;
  height: ${props => props.height * 100}%;
  background: ${props => props.color || props.theme.colors.primary.main + "40"};
  border: 2px solid ${props => props.color || props.theme.colors.primary.main};
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.color || props.theme.colors.primary.main + "60"};
  }
`;

const RegionLabel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 4px 8px;
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.primary};
  font-size: 0.875rem;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: ${props => props.theme.shadows[1]};
`;

interface MinimapRegionProps {
  region: Region;
  onClick?: (region: Region) => void;
}

export const MinimapRegion: React.FC<MinimapRegionProps> = ({
  region,
  onClick,
}) => {
  const handleClick = () => {
    onClick?.(region);
  };

  return (
    <Tooltip content={region.tooltip || region.label}>
      <RegionContainer
        x={region.x}
        y={region.y}
        width={region.width}
        height={region.height}
        color={region.color}
        onClick={handleClick}
      >
        {region.label && <RegionLabel>{region.label}</RegionLabel>}
      </RegionContainer>
    </Tooltip>
  );
};
