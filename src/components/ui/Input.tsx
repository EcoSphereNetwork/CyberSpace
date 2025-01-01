import React, { forwardRef } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";

type InputSize = "small" | "medium" | "large";
type InputVariant = "outlined" | "filled" | "standard";

interface InputStyleProps {
  size?: InputSize;
  variant?: InputVariant;
  error?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
}

const getInputStyles = ({
  size = "medium",
  variant = "outlined",
  error = false,
  fullWidth = false,
  disabled = false,
  theme,
}: InputStyleProps & { theme: any }) => css`
  width: ${fullWidth ? "100%" : "auto"};
  font-family: inherit;
  border-radius: 4px;
  transition: all 0.2s;
  cursor: ${disabled ? "not-allowed" : "text"};
  opacity: ${disabled ? 0.5 : 1};

  // Size styles
  ${size === "small" && css`
    padding: 6px 12px;
    font-size: 0.8125rem;
  `}
  ${size === "medium" && css`
    padding: 8px 16px;
    font-size: 0.875rem;
  `}
  ${size === "large" && css`
    padding: 10px 20px;
    font-size: 0.9375rem;
  `}

  // Variant styles
  ${variant === "outlined" && css`
    border: 1px solid ${error ? theme.colors.error.main : theme.colors.divider};
    background: transparent;

    &:hover:not(:disabled) {
      border-color: ${error ? theme.colors.error.dark : theme.colors.text.primary};
    }

    &:focus {
      outline: none;
      border-color: ${error ? theme.colors.error.main : theme.colors.primary.main};
      box-shadow: 0 0 0 3px ${error ? theme.colors.error.main : theme.colors.primary.main}40;
    }
  `}
  ${variant === "filled" && css`
    border: none;
    background: ${theme.colors.action.hover};
    border-bottom: 2px solid ${error ? theme.colors.error.main : "transparent"};

    &:hover:not(:disabled) {
      background: ${theme.colors.action.hover}CC;
    }

    &:focus {
      outline: none;
      background: ${theme.colors.action.hover}99;
      border-bottom-color: ${error ? theme.colors.error.main : theme.colors.primary.main};
    }
  `}
  ${variant === "standard" && css`
    border: none;
    border-bottom: 1px solid ${error ? theme.colors.error.main : theme.colors.divider};
    border-radius: 0;
    background: transparent;
    padding-left: 0;
    padding-right: 0;

    &:hover:not(:disabled) {
      border-bottom-color: ${error ? theme.colors.error.dark : theme.colors.text.primary};
    }

    &:focus {
      outline: none;
      border-bottom-width: 2px;
      border-bottom-color: ${error ? theme.colors.error.main : theme.colors.primary.main};
    }
  `}

  &::placeholder {
    color: ${theme.colors.text.disabled};
  }
`;

const StyledInput = styled.input<InputStyleProps>`
  ${props => getInputStyles(props)}
`;

export interface InputProps extends InputStyleProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  startAdornment,
  endAdornment,
  ...props
}, ref) => {
  if (startAdornment || endAdornment) {
    return (
      <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
        {startAdornment && (
          <div style={{ position: "absolute", left: 8, pointerEvents: "none" }}>
            {startAdornment}
          </div>
        )}
        <StyledInput
          ref={ref}
          style={{
            paddingLeft: startAdornment ? 36 : undefined,
            paddingRight: endAdornment ? 36 : undefined,
          }}
          {...props}
        />
        {endAdornment && (
          <div style={{ position: "absolute", right: 8, pointerEvents: "none" }}>
            {endAdornment}
          </div>
        )}
      </div>
    );
  }

  return <StyledInput ref={ref} {...props} />;
});

Input.displayName = "Input";
