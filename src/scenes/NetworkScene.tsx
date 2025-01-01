import React, { useState, useEffect } from "react";
import { useTheme } from "@emotion/react";
import { NetworkView } from "@/views/NetworkView";

interface NetworkSceneProps {
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const NetworkScene: React.FC<NetworkSceneProps> = ({
  onLoad,
  onError,
}) => {
  useEffect(() => {
    try {
      onLoad?.();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to load network scene'));
    }
  }, [onLoad, onError]);

  return <NetworkView />;
};
