import { useEffect, useRef, useState } from "react";

export interface ResizeObserverEntry {
  contentRect: DOMRectReadOnly;
  target: Element;
}

export const useResizeObserver = (
  target: Element | null,
  callback?: (entry: ResizeObserverEntry) => void
) => {
  const [size, setSize] = useState<DOMRectReadOnly>();
  const observerRef = useRef<ResizeObserver>();

  useEffect(() => {
    if (!target) return;

    const observer = new ResizeObserver(([entry]) => {
      setSize(entry.contentRect);
      callback?.(entry);
    });

    observer.observe(target);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [target, callback]);

  return size;
};
