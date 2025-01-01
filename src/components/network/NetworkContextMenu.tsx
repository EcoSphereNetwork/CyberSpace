import React from "react";
import styled from "@emotion/styled";
import { Menu } from "@/components/ui/Menu";
import { MenuItem } from "@/components/ui/MenuItem";
import { Icon } from "@/components/ui/Icon";

const MenuContainer = styled.div`
  position: fixed;
  z-index: 1000;
`;

export interface NetworkContextMenuProps {
  x: number;
  y: number;
  node: NetworkNode;
  onAction?: (action: string, node: NetworkNode) => void;
  onClose: () => void;
  onCopyId?: (id: string) => void;
  onHideNode?: (node: NetworkNode) => void;
  onExpandNode?: (node: NetworkNode) => void;
  onFocusNode?: (node: NetworkNode) => void;
  onShowDetails?: (node: NetworkNode) => void;
  onChangeStatus?: (node: NetworkNode, status: string) => void;
  onUngroupCluster?: (node: NetworkNode) => void;
}

export const NetworkContextMenu: React.FC<NetworkContextMenuProps> = ({
  x,
  y,
  node,
  onAction,
  onClose,
  onCopyId,
  onHideNode,
  onExpandNode,
  onFocusNode,
  onShowDetails,
  onChangeStatus,
  onUngroupCluster,
}) => {
  const handleAction = (action: string) => {
    onAction?.(action, node);
    onClose();
  };

  return (
    <MenuContainer style={{ left: x, top: y }}>
      <Menu>
        <MenuItem
          icon={<Icon name="content_copy" />}
          onClick={() => {
            onCopyId?.(node.id);
            onClose();
          }}
        >
          Copy ID
        </MenuItem>
        <MenuItem
          icon={<Icon name="info" />}
          onClick={() => {
            onShowDetails?.(node);
            onClose();
          }}
        >
          Show Details
        </MenuItem>
        <MenuItem
          icon={<Icon name="center_focus_strong" />}
          onClick={() => {
            onFocusNode?.(node);
            onClose();
          }}
        >
          Focus
        </MenuItem>
        <MenuItem
          icon={<Icon name="expand_more" />}
          onClick={() => {
            onExpandNode?.(node);
            onClose();
          }}
        >
          Expand
        </MenuItem>
        <MenuItem
          icon={<Icon name="visibility_off" />}
          onClick={() => {
            onHideNode?.(node);
            onClose();
          }}
        >
          Hide
        </MenuItem>
        {node.type === 'cluster' && (
          <MenuItem
            icon={<Icon name="unfold_less" />}
            onClick={() => {
              onUngroupCluster?.(node);
              onClose();
            }}
          >
            Ungroup
          </MenuItem>
        )}
        {node.status && (
          <MenuItem
            icon={<Icon name="refresh" />}
            onClick={() => {
              const nextStatus = 
                node.status === 'online' ? 'warning' :
                node.status === 'warning' ? 'error' :
                node.status === 'error' ? 'offline' :
                'online';
              onChangeStatus?.(node, nextStatus);
              onClose();
            }}
          >
            Change Status
          </MenuItem>
        )}
        {onAction && (
          <MenuItem
            icon={<Icon name="more_horiz" />}
            onClick={() => handleAction("more")}
          >
            More Actions...
          </MenuItem>
        )}
      </Menu>
    </MenuContainer>
  );
};
