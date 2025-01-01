import React, { useState, useCallback } from "react";
import styled from "@emotion/styled";
import { Window } from "./Window";
import { WindowState } from "./types";

const WindowManagerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
`;

interface WindowConfig {
  id: string;
  title: string;
  icon?: string;
  component: React.ComponentType<any>;
  props?: any;
  initialState?: Partial<WindowState>;
}

interface WindowManagerProps {
  windows: WindowConfig[];
  onWindowClose?: (id: string) => void;
  onWindowStateChange?: (id: string, state: WindowState) => void;
}

export const WindowManager: React.FC<WindowManagerProps> = ({
  windows,
  onWindowClose,
  onWindowStateChange,
}) => {
  const [windowStates, setWindowStates] = useState<Record<string, WindowState>>({});

  const handleStateChange = useCallback((id: string, state: WindowState) => {
    setWindowStates(prev => ({
      ...prev,
      [id]: state,
    }));
    onWindowStateChange?.(id, state);
  }, [onWindowStateChange]);

  const handleClose = useCallback((id: string) => {
    setWindowStates(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    onWindowClose?.(id);
  }, [onWindowClose]);

  return (
    <WindowManagerContainer>
      {windows.map(({ id, title, icon, component: Component, props, initialState }) => (
        <Window
          key={id}
          id={id}
          title={title}
          icon={icon}
          initialState={{
            x: 20 + (Object.keys(windowStates).length * 20),
            y: 20 + (Object.keys(windowStates).length * 20),
            ...initialState,
          }}
          onStateChange={(state) => handleStateChange(id, state)}
          onClose={() => handleClose(id)}
        >
          <Component {...props} />
        </Window>
      ))}
    </WindowManagerContainer>
  );
};
