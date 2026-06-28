import { useState, useCallback, useRef, useEffect } from "react";

interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

const MIN_SCALE = 0.05;
const MAX_SCALE = 5;

export const useCanvasInteraction = (containerRef: React.RefObject<HTMLDivElement>) => {
  const [canvasTransform, setCanvasTransform] = useState<CanvasTransform>({
    x: 0,
    y: 0,
    scale: 1,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialTransform = useRef({ x: 0, y: 0 });
  // Stable ref so wheel/pan handlers never go stale
  const transformRef = useRef(canvasTransform);
  transformRef.current = canvasTransform;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !e.repeat &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsDragging(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSpacePressed) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialTransform.current = { x: transformRef.current.x, y: transformRef.current.y };
  }, [isSpacePressed]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !isSpacePressed) return;
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    setCanvasTransform(prev => ({
      ...prev,
      x: initialTransform.current.x + deltaX,
      y: initialTransform.current.y + deltaY,
    }));
  }, [isDragging, isSpacePressed]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const t = transformRef.current;

    if (e.ctrlKey || e.metaKey) {
      // Pinch-to-zoom or Ctrl+scroll — smooth exponential zoom centered on cursor
      const zoomFactor = Math.exp(-e.deltaY * 0.003);
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, t.scale * zoomFactor));
      const scaleChange = newScale / t.scale;
      setCanvasTransform({
        x: mouseX - (mouseX - t.x) * scaleChange,
        y: mouseY - (mouseY - t.y) * scaleChange,
        scale: newScale,
      });
    } else {
      // Two-finger trackpad pan
      setCanvasTransform(prev => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, [containerRef]);

  return {
    canvasTransform,
    isSpacePressed,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    setCanvasTransform,
  };
};
