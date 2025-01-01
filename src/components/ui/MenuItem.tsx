import React from "react";
import styled from "@emotion/styled";
import { Icon } from "./Icon";

const MenuItemContainer = styled.div<{ colorType?: "primary" | "secondary" | "error" | "warning" | "info" | "success" }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  color: ${props => props.colorType ? props.theme.colors[props.colorType].main : props.theme.colors.text.primary};

  &:hover {
    background: ${props => props.theme.colors.action.hover};
  }
`;

const MenuItemIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: ${props => props.theme.colors.text.secondary};
`;

const MenuItemText = styled.div`
  flex: 1;
`;

export interface MenuItemProps {
  icon?: React.ReactNode;
  onClick?: () => void;
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  children: React.ReactNode;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  onClick,
  color,
  children,
}) => {
  return (
    <MenuItemContainer onClick={onClick} colorType={color}>
      {icon && <MenuItemIcon>{icon}</MenuItemIcon>}
      <MenuItemText>{children}</MenuItemText>
    </MenuItemContainer>
  );
};
