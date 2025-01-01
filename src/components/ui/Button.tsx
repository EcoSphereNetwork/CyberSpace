import React from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";

type ButtonVariant = "text" | "contained" | "outlined";
type ButtonColor = "primary" | "secondary" | "error" | "warning" | "success" | "info";
type ButtonSize = "small" | "medium" | "large";

interface ButtonStyleProps {
  $variant?: ButtonVariant;
  $color?: ButtonColor;
  $size?: ButtonSize;
  $fullWidth?: boolean;
  $disabled?: boolean;
}

const getButtonStyles = ({
  $variant = "contained",
  $color = "primary",
  $size = "medium",
  $fullWidth = false,
  $disabled = false,
  theme,
}: ButtonStyleProps & { theme: any }) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 4px;
  cursor: ${$disabled ? "not-allowed" : "pointer"};
  font-family: inherit;
  font-weight: 500;
  text-transform: uppercase;
  transition: all 0.2s;
  width: ${$fullWidth ? "100%" : "auto"};
  opacity: ${$disabled ? 0.5 : 1};

  // Size styles
  ${$size === "small" && css`
    padding: 6px 16px;
    font-size: 0.8125rem;
  `}
  ${$size === "medium" && css`
    padding: 8px 20px;
    font-size: 0.875rem;
  `}
  ${$size === "large" && css`
    padding: 10px 24px;
    font-size: 0.9375rem;
  `}

  // Variant styles
  ${$variant === "contained" && css`
    background: ${theme.colors[$color].main};
    color: ${theme.colors[$color].contrastText};

    &:hover:not(:disabled) {
      background: ${theme.colors[$color].dark};
    }
  `}
  ${$variant === "outlined" && css`
    background: transparent;
    color: ${theme.colors[$color].main};
    border: 1px solid ${theme.colors[$color].main};

    &:hover:not(:disabled) {
      background: ${theme.colors[$color].main}10;
    }
  `}
  ${$variant === "text" && css`
    background: transparent;
    color: ${theme.colors[$color].main};
    padding-left: 8px;
    padding-right: 8px;

    &:hover:not(:disabled) {
      background: ${theme.colors[$color].main}10;
    }
  `}

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${theme.colors[$color].main}40;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }
`;

const StyledButton = styled.button<ButtonStyleProps>`
  ${props => getButtonStyles(props)}
`;

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  color,
  size,
  fullWidth,
  startIcon,
  endIcon,
  loading,
  disabled,
  children,
  ...props
}) => {
  return (
    <StyledButton
      $variant={variant}
      $color={color}
      $size={size}
      $fullWidth={fullWidth}
      $disabled={loading || disabled}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <>
          <span className="loading-spinner" />
          {children}
        </>
      ) : (
        <>
          {startIcon}
          {children}
          {endIcon}
        </>
      )}
    </StyledButton>
  );
};
