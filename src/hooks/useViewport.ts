import { useState, useCallback } from "react";

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export const useViewport = (initialViewport?: Partial<Viewport>) => {
  const [viewport, setViewport] = useState<Viewport>({
    x: initialViewport?.x || 0,
    y: initialViewport?.y || 0,
    zoom: initialViewport?.zoom || 1,
  });

  const updateViewport = useCallback((newViewport: Partial<Viewport>) => {
    setViewport(prev => ({
      ...prev,
      ...newViewport,
    }));
  }, []);

  return { viewport, setViewport: updateViewport };
};
