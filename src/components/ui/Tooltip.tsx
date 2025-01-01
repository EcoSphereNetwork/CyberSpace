import React, { useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";

type TooltipPlacement = "top" | "right" | "bottom" | "left";

interface TooltipStyleProps {
  placement?: TooltipPlacement;
  visible?: boolean;
}

const getTooltipStyles = ({
  placement = "top",
  visible = false,
  theme,
}: TooltipStyleProps & { theme: any }) => css`
  position: absolute;
  padding: 6px 12px;
  border-radius: 4px;
  background: ${theme.colors.grey[800]};
  color: ${theme.colors.common.white};
  font-size: 0.75rem;
  white-space: nowrap;
  pointer-events: none;
  opacity: ${visible ? 1 : 0};
  transition: all 0.2s;
  z-index: 1500;

  ${placement === "top" && css`
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-8px);
  `}
  ${placement === "right" && css`
    left: 100%;
    top: 50%;
    transform: translateY(-50%) translateX(8px);
  `}
  ${placement === "bottom" && css`
    top: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(8px);
  `}
  ${placement === "left" && css`
    right: 100%;
    top: 50%;
    transform: translateY(-50%) translateX(-8px);
  `}
`;

const TooltipContainer = styled.div`
  position: relative;
  display: inline-flex;
`;

const TooltipContent = styled.div<TooltipStyleProps>`
  ${props => getTooltipStyles(props)}
`;

export interface TooltipProps {
  content: React.ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
  children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  placement = "top",
  delay = 200,
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <TooltipContainer
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <TooltipContent placement={placement} visible={visible}>
        {content}
      </TooltipContent>
    </TooltipContainer>
  );
};
