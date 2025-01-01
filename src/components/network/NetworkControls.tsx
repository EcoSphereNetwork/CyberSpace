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

interface NetworkControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenter: () => void;
}

export const NetworkControls: React.FC<NetworkControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onCenter,
}) => {
  return (
    <ControlsContainer>
      <Tooltip content="Zoom in" placement="left">
        <IconButton onClick={onZoomIn}>
          <Icon name="zoomIn" />
        </IconButton>
      </Tooltip>
      <Tooltip content="Zoom out" placement="left">
        <IconButton onClick={onZoomOut}>
          <Icon name="zoomOut" />
        </IconButton>
      </Tooltip>
      <Tooltip content="Center view" placement="left">
        <IconButton onClick={onCenter}>
          <Icon name="centerFocusStrong" />
        </IconButton>
      </Tooltip>
    </ControlsContainer>
  );
};
