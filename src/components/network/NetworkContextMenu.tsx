import React from "react";
import styled from "@emotion/styled";
import { Menu } from "@/components/ui/Menu";
import { MenuItem } from "@/components/ui/MenuItem";
import { Icon } from "@/components/ui/Icon";

const MenuContainer = styled.div`
  position: fixed;
  z-index: 1000;
`;

export interface NetworkObject {
  id: string;
  type: string;
  status: "online" | "offline" | "warning" | "error";
  metadata?: Record<string, any>;
}

export interface NetworkContextMenuProps {
  x: number;
  y: number;
  object: NetworkObject;
  onAction: (action: string) => void;
  onClose: () => void;
}

export const NetworkContextMenu: React.FC<NetworkContextMenuProps> = ({
  x,
  y,
  object,
  onAction,
  onClose,
}) => {
  const handleAction = (action: string) => {
    onAction(action);
    onClose();
  };

  return (
    <MenuContainer style={{ left: x, top: y }}>
      <Menu>
        <MenuItem
          icon={<Icon name="info" />}
          onClick={() => handleAction("info")}
        >
          View Details
        </MenuItem>
        <MenuItem
          icon={<Icon name="edit" />}
          onClick={() => handleAction("edit")}
        >
          Edit
        </MenuItem>
        {object.type === "node" && (
          <>
            <MenuItem
              icon={<Icon name="refresh" />}
              onClick={() => handleAction("restart")}
            >
              Restart
            </MenuItem>
            <MenuItem
              icon={<Icon name="terminal" />}
              onClick={() => handleAction("terminal")}
            >
              Open Terminal
            </MenuItem>
          </>
        )}
        {object.type === "link" && (
          <>
            <MenuItem
              icon={<Icon name="analytics" />}
              onClick={() => handleAction("monitor")}
            >
              Monitor Traffic
            </MenuItem>
            <MenuItem
              icon={<Icon name="block" />}
              onClick={() => handleAction("block")}
            >
              Block Traffic
            </MenuItem>
          </>
        )}
        <MenuItem
          icon={<Icon name="delete" />}
          onClick={() => handleAction("delete")}
          color="error"
        >
          Delete
        </MenuItem>
      </Menu>
    </MenuContainer>
  );
};
