import React from 'react';
import styled from '@emotion/styled';

const ContextMenuContainer = styled.div<{ x: number; y: number }>`
  position: fixed;
  left: ${({ x }) => `${x}px`};
  top: ${({ y }) => `${y}px`};
  background-color: #1a1a1a;
  color: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 200px;
`;

const MenuHeader = styled.div`
  border-bottom: 1px solid #333;
  padding-bottom: 5px;
  margin-bottom: 10px;
`;

const ObjectName = styled.span`
  font-weight: bold;
`;

const ObjectType = styled.span`
  color: #888;
  margin-left: 10px;
`;

const ObjectStatus = styled.span<{ status: 'online' | 'offline' | 'warning' | 'error' }>`
  margin-left: 10px;
  color: ${({ status }) => {
    switch (status) {
      case 'online':
        return '#00cc66';
      case 'offline':
        return '#888';
      case 'warning':
        return '#ffaa00';
      case 'error':
        return '#ff0000';
    }
  }};
`;

const MenuActions = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MenuItem = styled.li`
  padding: 5px 0;
  cursor: pointer;
  border-bottom: 1px solid #333;

  &:hover {
    background-color: #00cc66;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const MenuOptions = styled.div`
  margin-top: 10px;
`;

const MenuButton = styled.button`
  display: block;
  width: 100%;
  margin: 5px 0;
  padding: 5px;
  background-color: #333;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 3px;

  &:hover {
    background-color: #00cc66;
  }
`;

const MenuHelp = styled.div`
  margin-top: 10px;
  font-size: 0.8em;
  text-align: right;

  a {
    color: #00ccff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

interface NetworkContextMenuProps {
  x: number;
  y: number;
  object: {
    id: string;
    type: string;
    status: 'online' | 'offline' | 'warning' | 'error';
  };
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
    <ContextMenuContainer x={x} y={y}>
      <MenuHeader>
        <ObjectName>{object.id}</ObjectName>
        <ObjectType>{object.type}</ObjectType>
        <ObjectStatus status={object.status}>
          {object.status}
        </ObjectStatus>
      </MenuHeader>

      <MenuActions>
        <MenuItem onClick={() => handleAction('disconnect')}>
          Disconnect
        </MenuItem>
        <MenuItem onClick={() => handleAction('diagnose')}>
          Run Diagnostics
        </MenuItem>
        <MenuItem onClick={() => handleAction('logs')}>
          View Logs
        </MenuItem>
      </MenuActions>

      <MenuOptions>
        <MenuButton onClick={() => handleAction('settings')}>
          Settings
        </MenuButton>
        <MenuButton onClick={() => handleAction('properties')}>
          Properties
        </MenuButton>
        <MenuButton onClick={() => handleAction('note')}>
          Add Note
        </MenuButton>
      </MenuOptions>

      <MenuHelp>
        <a href="#" onClick={() => handleAction('help')}>
          Help
        </a>
      </MenuHelp>
    </ContextMenuContainer>
  );
};
