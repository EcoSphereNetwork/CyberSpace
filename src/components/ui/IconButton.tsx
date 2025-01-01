import React from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { ButtonProps } from "./Button";

interface IconButtonStyleProps {
  color?: ButtonProps["color"];
  size?: "small" | "medium" | "large";
  active?: boolean;
  disabled?: boolean;
}

const getIconButtonStyles = ({
  color = "primary",
  size = "medium",
  active = false,
  disabled = false,
  theme,
}: IconButtonStyleProps & { theme: any }) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: ${disabled ? "not-allowed" : "pointer"};
  background: ${active ? theme.colors[color].main + "20" : "transparent"};
  color: ${theme.colors[color].main};
  transition: all 0.2s;
  opacity: ${disabled ? 0.5 : 1};

  // Size styles
  ${size === "small" && css`
    width: 32px;
    height: 32px;
    font-size: 1rem;
  `}
  ${size === "medium" && css`
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  `}
  ${size === "large" && css`
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  `}

  &:hover:not(:disabled) {
    background: ${theme.colors[color].main}20;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${theme.colors[color].main}40;
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

const StyledIconButton = styled.button<IconButtonStyleProps>`
  ${props => getIconButtonStyles(props)}
`;

export interface IconButtonProps extends IconButtonStyleProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  tooltip?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  tooltip,
  ...props
}) => {
  return (
    <StyledIconButton {...props}>
      {children}
    </StyledIconButton>
  );
};
