import React from "react";
import styled from "@emotion/styled";
import { IconButton } from "@/components/ui/IconButton";
import { Icon } from "@/components/ui/Icon";

const WindowContainer = styled.div<{ isActive?: boolean }>`
  position: absolute;
  min-width: 200px;
  min-height: 100px;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 4px;
  box-shadow: ${props => props.theme.shadows[props.isActive ? 8 : 4]};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.2s ease-in-out;
`;

const WindowHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  background: ${props => props.theme.colors.background.default};
  border-bottom: 1px solid ${props => props.theme.colors.divider};
  cursor: move;
`;

const WindowTitle = styled.div`
  flex: 1;
  font-weight: 500;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const WindowContent = styled.div`
  flex: 1;
  overflow: auto;
  padding: 16px;
`;

export interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isActive?: boolean;
  onFocus?: () => void;
  onClose?: () => void;
}

export const Window: React.FC<WindowProps> = ({
  id,
  title,
  children,
  isActive,
  onFocus,
  onClose,
}) => {
  return (
    <WindowContainer
      isActive={isActive}
      onClick={onFocus}
    >
      <WindowHeader>
        <WindowTitle>{title}</WindowTitle>
        <IconButton
          onClick={onClose}
          aria-label="Close"
          size="small"
        >
          <Icon name="close" />
        </IconButton>
      </WindowHeader>
      <WindowContent>
        {children}
      </WindowContent>
    </WindowContainer>
  );
};
