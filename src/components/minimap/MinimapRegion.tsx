import React from "react";
import styled from "@emotion/styled";
import { Region } from "./types";

interface RegionContainerProps {
  $x: number;
  $y: number;
  $width: number;
  $height: number;
  $color?: string;
}

const RegionContainer = styled.div<RegionContainerProps>`
  position: absolute;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
  background: ${props => props.$color || props.theme.colors.primary.main + "40"};
  border: 1px solid ${props => props.$color || props.theme.colors.primary.main};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.$color || props.theme.colors.primary.main + "60"};
  }
`;

export interface MinimapRegionProps {
  region: Region;
  onClick?: (region: Region) => void;
}

export const MinimapRegion: React.FC<MinimapRegionProps> = ({
  region,
  onClick,
}) => {
  return (
    <RegionContainer
      $x={region.x}
      $y={region.y}
      $width={region.width}
      $height={region.height}
      $color={region.color}
      onClick={() => onClick?.(region)}
    />
  );
};
