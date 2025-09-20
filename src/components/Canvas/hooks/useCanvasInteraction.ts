import { useState, useCallback, useRef, useEffect } from "react";

interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

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

  // Handle space key for pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
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
    initialTransform.current = { x: canvasTransform.x, y: canvasTransform.y };
  }, [isSpacePressed, canvasTransform.x, canvasTransform.y]);

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

  // Navigation with arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 50;
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setCanvasTransform(prev => ({ ...prev, y: prev.y + step }));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setCanvasTransform(prev => ({ ...prev, y: prev.y - step }));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setCanvasTransform(prev => ({ ...prev, x: prev.x + step }));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCanvasTransform(prev => ({ ...prev, x: prev.x - step }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey && !e.metaKey) return;
    
    e.preventDefault();
    
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(3, canvasTransform.scale * scaleFactor));
    
    // Get mouse position relative to container
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate zoom center
    const scaleChange = newScale / canvasTransform.scale;
    const newX = mouseX - (mouseX - canvasTransform.x) * scaleChange;
    const newY = mouseY - (mouseY - canvasTransform.y) * scaleChange;
    
    setCanvasTransform({
      x: newX,
      y: newY,
      scale: newScale,
    });
  }, [canvasTransform, containerRef]);

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