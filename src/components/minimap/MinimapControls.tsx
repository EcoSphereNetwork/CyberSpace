import React from "react";
import styled from "@emotion/styled";
import { IconButton } from "@/components/ui/IconButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { Icon } from "@/components/ui/Icon";
import { Point } from "./types";

const ControlsContainer = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 4px;
  padding: 4px;
  box-shadow: ${props => props.theme.shadows[1]};
`;

interface MinimapControlsProps {
  viewport: Point & { zoom: number };
  onChange: (viewport: Point & { zoom: number }) => void;
  onViewportChange?: (viewport: Point & { zoom: number }) => void;
}

export const MinimapControls: React.FC<MinimapControlsProps> = ({
  viewport,
  onChange,
  onViewportChange,
}) => {
  const handleZoomIn = () => {
    const newZoom = Math.min(viewport.zoom * 0.8, 1);
    const newViewport = {
      ...viewport,
      zoom: newZoom,
      x: viewport.x + (viewport.zoom - newZoom) / 2,
      y: viewport.y + (viewport.zoom - newZoom) / 2,
    };
    onChange(newViewport);
    onViewportChange?.(newViewport);
  };

  const handleZoomOut = () => {
    const newZoom = Math.min(viewport.zoom * 1.2, 1);
    const newViewport = {
      ...viewport,
      zoom: newZoom,
      x: viewport.x - (newZoom - viewport.zoom) / 2,
      y: viewport.y - (newZoom - viewport.zoom) / 2,
    };
    onChange(newViewport);
    onViewportChange?.(newViewport);
  };

  const handleReset = () => {
    const newViewport = {
      x: 0,
      y: 0,
      zoom: 1,
    };
    onChange(newViewport);
    onViewportChange?.(newViewport);
  };

  return (
    <ControlsContainer>
      <Tooltip content="Zoom in" placement="left">
        <IconButton onClick={handleZoomIn} disabled={viewport.zoom <= 0.2}>
          <Icon name="zoomIn" />
        </IconButton>
      </Tooltip>
      <Tooltip content="Zoom out" placement="left">
        <IconButton onClick={handleZoomOut} disabled={viewport.zoom >= 1}>
          <Icon name="zoomOut" />
        </IconButton>
      </Tooltip>
      <Tooltip content="Reset view" placement="left">
        <IconButton onClick={handleReset}>
          <Icon name="refresh" />
        </IconButton>
      </Tooltip>
    </ControlsContainer>
  );
};
