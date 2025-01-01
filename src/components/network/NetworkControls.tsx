import React from "react";
import styled from "@emotion/styled";
import { IconButton } from "@/components/ui/IconButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { Icon } from "@/components/ui/Icon";

const ControlsContainer = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 8px;
  padding: 8px;
  box-shadow: ${props => props.theme.shadows[2]};
`;

const Divider = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.divider};
  margin: 4px 0;
`;

interface NetworkControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleLayout?: () => void;
  onToggleParticles?: () => void;
  onToggleLabels?: () => void;
  showParticles?: boolean;
  showLabels?: boolean;
}

export const NetworkControls: React.FC<NetworkControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleLayout,
  onToggleParticles,
  onToggleLabels,
  showParticles = true,
  showLabels = true,
}) => {
  return (
    <ControlsContainer>
      <Tooltip content="Zoom in" placement="left">
        <IconButton onClick={onZoomIn}>
          <Icon name="add" />
        </IconButton>
      </Tooltip>
      <Tooltip content="Zoom out" placement="left">
        <IconButton onClick={onZoomOut}>
          <Icon name="remove" />
        </IconButton>
      </Tooltip>
      <Tooltip content="Reset view" placement="left">
        <IconButton onClick={onReset}>
          <Icon name="center_focus_strong" />
        </IconButton>
      </Tooltip>
      <Divider />
      {onToggleLayout && (
        <Tooltip content="Change layout" placement="left">
          <IconButton onClick={onToggleLayout}>
            <Icon name="auto_graph" />
          </IconButton>
        </Tooltip>
      )}
      {onToggleParticles && (
        <Tooltip content={showParticles ? "Hide particles" : "Show particles"} placement="left">
          <IconButton onClick={onToggleParticles}>
            <Icon name={showParticles ? "blur_on" : "blur_off"} />
          </IconButton>
        </Tooltip>
      )}
      {onToggleLabels && (
        <Tooltip content={showLabels ? "Hide labels" : "Show labels"} placement="left">
          <IconButton onClick={onToggleLabels}>
            <Icon name={showLabels ? "label" : "label_off"} />
          </IconButton>
        </Tooltip>
      )}
    </ControlsContainer>
  );
};
