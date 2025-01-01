import React, { useState } from "react";
import styled from "@emotion/styled";
import { Window } from "./Window";

const WindowContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

export interface WindowConfig {
  id: string;
  title: string;
  children: React.ReactNode;
  component?: () => React.ReactNode;
  onFocus?: () => void;
  onClose?: () => void;
}

export interface WindowManagerProps {
  windows: WindowConfig[];
  onFocus?: (id: string) => void;
  onClose?: (id: string) => void;
}

export const WindowManager: React.FC<WindowManagerProps> = ({
  windows,
  onFocus,
  onClose,
}) => {
  const [activeWindow, setActiveWindow] = useState<string | null>(null);

  const handleFocus = (id: string) => {
    setActiveWindow(id);
    onFocus?.(id);
  };

  const handleClose = (id: string) => {
    if (activeWindow === id) {
      setActiveWindow(null);
    }
    onClose?.(id);
  };

  return (
    <WindowContainer>
      {windows.map(window => (
        <Window
          key={window.id}
          id={window.id}
          title={window.title}
          isActive={activeWindow === window.id}
          onFocus={() => handleFocus(window.id)}
          onClose={() => handleClose(window.id)}
        >
          {window.component ? window.component() : window.children}
        </Window>
      ))}
    </WindowContainer>
  );
};
