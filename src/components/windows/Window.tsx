import React, { useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { useDrag } from "@/hooks/useDrag";
import { useResize } from "@/hooks/useResize";
import { WindowState } from "./types";

const WindowContainer = styled.div<{
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
}>`
  position: absolute;
  left: ${props => props.isMaximized ? 0 : props.x}px;
  top: ${props => props.isMaximized ? 0 : props.y}px;
  width: ${props => props.isMaximized ? "100%" : props.width + "px"};
  height: ${props => props.isMaximized ? "100%" : props.height + "px"};
  background: ${props => props.theme.colors.background.paper};
  border-radius: 8px;
  box-shadow: ${props => props.theme.shadows[2]};
  display: ${props => props.isMinimized ? "none" : "flex"};
  flex-direction: column;
  overflow: hidden;
  z-index: ${props => props.zIndex};
  transition: ${props => props.isMaximized ? "all 0.3s" : "none"};
`;

const WindowHeader = styled.div<{ isDragging: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: ${props => props.theme.colors.background.default};
  cursor: ${props => props.isDragging ? "grabbing" : "grab"};
  user-select: none;
`;

const WindowTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
`;

const WindowActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const WindowContent = styled.div`
  flex: 1;
  overflow: auto;
  position: relative;
`;

const ResizeHandle = styled.div<{ position: string }>`
  position: absolute;
  ${props => {
    switch (props.position) {
      case "n":
        return "top: 0; left: 0; right: 0; height: 4px; cursor: ns-resize;";
      case "e":
        return "top: 0; right: 0; bottom: 0; width: 4px; cursor: ew-resize;";
      case "s":
        return "bottom: 0; left: 0; right: 0; height: 4px; cursor: ns-resize;";
      case "w":
        return "top: 0; left: 0; bottom: 0; width: 4px; cursor: ew-resize;";
      case "nw":
        return "top: 0; left: 0; width: 8px; height: 8px; cursor: nw-resize;";
      case "ne":
        return "top: 0; right: 0; width: 8px; height: 8px; cursor: ne-resize;";
      case "se":
        return "bottom: 0; right: 0; width: 8px; height: 8px; cursor: se-resize;";
      case "sw":
        return "bottom: 0; left: 0; width: 8px; height: 8px; cursor: sw-resize;";
      default:
        return "";
    }
  }}
`;

interface WindowProps {
  id: string;
  title: string;
  icon?: string;
  initialState?: Partial<WindowState>;
  onStateChange?: (state: WindowState) => void;
  onClose?: () => void;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({
  id,
  title,
  icon,
  initialState,
  onStateChange,
  onClose,
  children,
}) => {
  const [state, setState] = useState<WindowState>({
    x: initialState?.x || 0,
    y: initialState?.y || 0,
    width: initialState?.width || 800,
    height: initialState?.height || 600,
    isMaximized: initialState?.isMaximized || false,
    isMinimized: initialState?.isMinimized || false,
    zIndex: initialState?.zIndex || 1,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  // Handle window dragging
  const { isDragging } = useDrag(headerRef, {
    onDrag: (dx, dy) => {
      if (state.isMaximized) return;
      setState(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }));
    },
  });

  // Handle window resizing
  useResize(containerRef, {
    handles: ["n", "e", "s", "w", "nw", "ne", "se", "sw"],
    minWidth: 320,
    minHeight: 240,
    onResize: (width, height, x, y) => {
      if (state.isMaximized) return;
      setState(prev => ({
        ...prev,
        width,
        height,
        x,
        y,
      }));
    },
  });

  // Handle window focus
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) {
        setState(prev => ({ ...prev, zIndex: Date.now() }));
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const handleMaximize = () => {
    setState(prev => ({
      ...prev,
      isMaximized: !prev.isMaximized,
      isMinimized: false,
    }));
  };

  const handleMinimize = () => {
    setState(prev => ({
      ...prev,
      isMinimized: !prev.isMinimized,
    }));
  };

  return (
    <WindowContainer
      ref={containerRef}
      {...state}
    >
      <WindowHeader
        ref={headerRef}
        isDragging={isDragging}
        onDoubleClick={handleMaximize}
      >
        <WindowTitle>
          {icon && <Icon name={icon} />}
          {title}
        </WindowTitle>
        <WindowActions>
          <Tooltip content="Minimize">
            <IconButton
              size="small"
              onClick={handleMinimize}
            >
              <Icon name="remove" />
            </IconButton>
          </Tooltip>
          <Tooltip content={state.isMaximized ? "Restore" : "Maximize"}>
            <IconButton
              size="small"
              onClick={handleMaximize}
            >
              <Icon name={state.isMaximized ? "crop_square" : "crop_din"} />
            </IconButton>
          </Tooltip>
          {onClose && (
            <Tooltip content="Close">
              <IconButton
                size="small"
                color="error"
                onClick={onClose}
              >
                <Icon name="close" />
              </IconButton>
            </Tooltip>
          )}
        </WindowActions>
      </WindowHeader>
      <WindowContent>
        {children}
        {!state.isMaximized && (
          <>
            <ResizeHandle position="n" />
            <ResizeHandle position="e" />
            <ResizeHandle position="s" />
            <ResizeHandle position="w" />
            <ResizeHandle position="nw" />
            <ResizeHandle position="ne" />
            <ResizeHandle position="se" />
            <ResizeHandle position="sw" />
          </>
        )}
      </WindowContent>
    </WindowContainer>
  );
};
