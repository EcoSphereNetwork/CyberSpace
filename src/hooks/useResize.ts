import { useEffect, useCallback } from "react";

interface ResizeConfig {
  handles?: string[];
  minWidth?: number;
  minHeight?: number;
  onResize?: (width: number, height: number, x: number, y: number) => void;
}

export const useResize = (
  ref: React.RefObject<HTMLElement>,
  config: ResizeConfig = {}
) => {
  const {
    handles = ["n", "e", "s", "w", "nw", "ne", "se", "sw"],
    minWidth = 100,
    minHeight = 100,
    onResize,
  } = config;

  const handleResize = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const width = Math.max(minWidth, rect.width);
      const height = Math.max(minHeight, rect.height);
      const x = rect.x;
      const y = rect.y;

      onResize?.(width, height, x, y);
    },
    [ref, minWidth, minHeight, onResize]
  );

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const rect = element.getBoundingClientRect();
        onResize?.(width, height, rect.x, rect.y);
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref, onResize]);

  return { handleResize };
};
