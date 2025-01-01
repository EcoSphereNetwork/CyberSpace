import React from "react";
import styled from "@emotion/styled";
import { IconButton } from "@/components/ui/IconButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { Icon } from "@/components/ui/Icon";
import { NetworkViewMode } from "./types";

const ToolbarContainer = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  gap: 8px;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 8px;
  padding: 8px;
  box-shadow: ${props => props.theme.shadows[2]};
`;

const Divider = styled.div`
  width: 1px;
  background: ${props => props.theme.colors.divider};
  margin: 0 4px;
`;

interface NetworkToolbarProps {
  viewMode: NetworkViewMode;
  onViewModeChange: (mode: NetworkViewMode) => void;
  onRefresh: () => void;
  onExport: () => void;
  onFilter: () => void;
  onSearch: () => void;
}

export const NetworkToolbar: React.FC<NetworkToolbarProps> = ({
  viewMode,
  onViewModeChange,
  onRefresh,
  onExport,
  onFilter,
  onSearch,
}) => {
  return (
    <ToolbarContainer>
      <Tooltip content="2D View">
        <IconButton
          onClick={() => onViewModeChange("2d")}
          active={viewMode === "2d"}
        >
          <Icon name="view2d" />
        </IconButton>
      </Tooltip>
      <Tooltip content="3D View">
        <IconButton
          onClick={() => onViewModeChange("3d")}
          active={viewMode === "3d"}
        >
          <Icon name="view3d" />
        </IconButton>
      </Tooltip>
      <Divider />
      <Tooltip content="Refresh">
        <IconButton onClick={onRefresh}>
          <Icon name="refresh" />
        </IconButton>
      </Tooltip>
      <Tooltip content="Export">
        <IconButton onClick={onExport}>
          <Icon name="download" />
        </IconButton>
      </Tooltip>
      <Divider />
      <Tooltip content="Filter">
        <IconButton onClick={onFilter}>
          <Icon name="filter" />
        </IconButton>
      </Tooltip>
      <Tooltip content="Search">
        <IconButton onClick={onSearch}>
          <Icon name="search" />
        </IconButton>
      </Tooltip>
    </ToolbarContainer>
  );
};
