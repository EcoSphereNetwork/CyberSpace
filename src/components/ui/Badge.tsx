import React from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";

type BadgeColor = "primary" | "secondary" | "error" | "warning" | "success" | "info";
type BadgeVariant = "standard" | "dot";
type BadgeAnchorOrigin = {
  vertical: "top" | "bottom";
  horizontal: "left" | "right";
};

interface BadgeStyleProps {
  color?: BadgeColor;
  variant?: BadgeVariant;
  anchorOrigin?: BadgeAnchorOrigin;
  invisible?: boolean;
  overlap?: "rectangular" | "circular";
}

const getBadgeStyles = ({
  color = "primary",
  variant = "standard",
  anchorOrigin = { vertical: "top", horizontal: "right" },
  invisible = false,
  overlap = "rectangular",
  theme,
}: BadgeStyleProps & { theme: any }) => css`
  position: absolute;
  display: flex;
  flex-flow: row wrap;
  place-content: center;
  align-items: center;
  box-sizing: border-box;
  font-family: inherit;
  font-weight: 500;
  transition: transform 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  opacity: ${invisible ? 0 : 1};
  transform: scale(${invisible ? 0 : 1});
  transform-origin: ${anchorOrigin.horizontal} ${anchorOrigin.vertical};

  ${variant === "standard" && css`
    height: 20px;
    min-width: 20px;
    padding: 0 6px;
    border-radius: 10px;
    background: ${theme.colors[color].main};
    color: ${theme.colors[color].contrastText};
    font-size: 0.75rem;
  `}

  ${variant === "dot" && css`
    height: 8px;
    min-width: 8px;
    padding: 0;
    border-radius: 4px;
    background: ${theme.colors[color].main};
  `}

  ${anchorOrigin.vertical === "top" && css`
    top: ${overlap === "rectangular" ? -8 : 0}px;
  `}
  ${anchorOrigin.vertical === "bottom" && css`
    bottom: ${overlap === "rectangular" ? -8 : 0}px;
  `}
  ${anchorOrigin.horizontal === "left" && css`
    left: ${overlap === "rectangular" ? -8 : 0}px;
  `}
  ${anchorOrigin.horizontal === "right" && css`
    right: ${overlap === "rectangular" ? -8 : 0}px;
  `}
`;

const BadgeContainer = styled.span`
  position: relative;
  display: inline-flex;
  vertical-align: middle;
  flex-shrink: 0;
`;

const BadgeContent = styled.span<BadgeStyleProps>`
  ${props => getBadgeStyles(props)}
`;

export interface BadgeProps extends BadgeStyleProps {
  badgeContent?: React.ReactNode;
  children: React.ReactElement;
  max?: number;
  showZero?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  badgeContent,
  children,
  max = 99,
  showZero = false,
  variant = "standard",
  invisible: invisibleProp,
  ...props
}) => {
  const invisible = invisibleProp ?? (
    (badgeContent === 0 && !showZero) ||
    (badgeContent == null && variant !== "dot")
  );

  const displayValue = variant === "standard" && typeof badgeContent === "number" && badgeContent > max
    ? `${max}+`
    : badgeContent;

  return (
    <BadgeContainer>
      {children}
      <BadgeContent
        variant={variant}
        invisible={invisible}
        {...props}
      >
        {variant === "standard" ? displayValue : null}
      </BadgeContent>
    </BadgeContainer>
  );
};
