import React from "react";
import styled from "@emotion/styled";

const MenuContainer = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 4px;
  box-shadow: ${props => props.theme.shadows[2]};
  padding: 4px;
  min-width: 200px;
`;

export interface MenuProps {
  children: React.ReactNode;
}

export const Menu: React.FC<MenuProps> = ({ children }) => {
  return <MenuContainer>{children}</MenuContainer>;
};
