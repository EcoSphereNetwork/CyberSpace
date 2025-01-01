import React from "react";
import styled from "@emotion/styled";
import { IconButton } from "@/components/ui/IconButton";
import { Icon } from "@/components/ui/Icon";

const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 4px;
  box-shadow: ${props => props.theme.shadows[1]};
`;

export interface NetworkToolbarProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetCamera?: () => void;
  onLayerChange?: (layer: string) => void;
  onHelp?: () => void;
}

export const NetworkToolbar: React.FC<NetworkToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onResetCamera,
  onLayerChange,
  onHelp,
}) => {
  return (
    <ToolbarContainer>
      <IconButton onClick={onZoomIn} aria-label="Zoom In">
        <Icon name="zoom_in" />
      </IconButton>
      <IconButton onClick={onZoomOut} aria-label="Zoom Out">
        <Icon name="zoom_out" />
      </IconButton>
      <IconButton onClick={onResetCamera} aria-label="Reset Camera">
        <Icon name="center_focus_strong" />
      </IconButton>
      <IconButton onClick={() => onLayerChange?.("2d")} aria-label="2D View">
        <Icon name="view_in_ar" />
      </IconButton>
      <IconButton onClick={() => onLayerChange?.("3d")} aria-label="3D View">
        <Icon name="view_in_ar" />
      </IconButton>
      <IconButton onClick={onHelp} aria-label="Help">
        <Icon name="help_outline" />
      </IconButton>
    </ToolbarContainer>
  );
};
