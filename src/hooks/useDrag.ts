import { useEffect, useCallback, useState } from "react";

interface DragConfig {
  onDrag?: (dx: number, dy: number) => void;
  onDragStart?: (x: number, y: number) => void;
  onDragEnd?: (x: number, y: number) => void;
}

export const useDrag = (
  ref: React.RefObject<HTMLElement>,
  config: DragConfig = {}
) => {
  const { onDrag, onDragStart, onDragEnd } = config;
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) return;

      setIsDragging(true);
      setStartPos({ x: e.clientX, y: e.clientY });
      onDragStart?.(e.clientX, e.clientY);
    },
    [ref, onDragStart]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      onDrag?.(dx, dy);
      setStartPos({ x: e.clientX, y: e.clientY });
    },
    [isDragging, startPos, onDrag]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      setIsDragging(false);
      onDragEnd?.(e.clientX, e.clientY);
    },
    [isDragging, onDragEnd]
  );

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    element.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [ref, handleMouseDown, handleMouseMove, handleMouseUp]);

  return { isDragging };
};
