import React, { useState, useCallback, useRef } from "react";
import { CanvasElement } from "./Canvas";

interface ResizeHandle {
  position: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
  x: number;
  y: number;
}

interface ResizeHandlesProps {
  element: CanvasElement;
  onUpdateSilent: (id: string, updates: Partial<CanvasElement>) => void;
  onResizeEnd: () => void;
  isVisible: boolean;
  canvasScale: number;
}

export const ResizeHandles = ({ element, onUpdateSilent, onResizeEnd, isVisible, canvasScale }: ResizeHandlesProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const startPos = useRef({ mouseX: 0, mouseY: 0, width: 0, height: 0, elemX: 0, elemY: 0 });

  // Stable refs so handler never goes stale
  const canvasScaleRef = useRef(canvasScale);
  canvasScaleRef.current = canvasScale;
  const onUpdateSilentRef = useRef(onUpdateSilent);
  onUpdateSilentRef.current = onUpdateSilent;
  const onResizeEndRef = useRef(onResizeEnd);
  onResizeEndRef.current = onResizeEnd;
  const elementIdRef = useRef(element.id);
  elementIdRef.current = element.id;

  const handles: ResizeHandle[] = [
    { position: 'nw', x: -4, y: -4 },
    { position: 'ne', x: element.width - 4, y: -4 },
    { position: 'sw', x: -4, y: element.height - 4 },
    { position: 'se', x: element.width - 4, y: element.height - 4 },
    { position: 'n', x: element.width / 2 - 4, y: -4 },
    { position: 's', x: element.width / 2 - 4, y: element.height - 4 },
    { position: 'e', x: element.width - 4, y: element.height / 2 - 4 },
    { position: 'w', x: -4, y: element.height / 2 - 4 },
  ];

  const handleMouseDown = useCallback((e: React.MouseEvent, handlePos: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handlePos);
    startPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: element.width,
      height: element.height,
      elemX: element.x,
      elemY: element.y,
    };
  }, [element.width, element.height, element.x, element.y]);

  // Stable handler — reads everything from refs
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizeHandle) return;

    const scale = canvasScaleRef.current;
    const deltaX = (e.clientX - startPos.current.mouseX) / scale;
    const deltaY = (e.clientY - startPos.current.mouseY) / scale;

    const minSize = 20;
    let newWidth = startPos.current.width;
    let newHeight = startPos.current.height;
    let newX = startPos.current.elemX;
    let newY = startPos.current.elemY;

    switch (resizeHandle) {
      case 'se':
        newWidth = Math.max(minSize, startPos.current.width + deltaX);
        newHeight = Math.max(minSize, startPos.current.height + deltaY);
        break;
      case 'sw':
        newWidth = Math.max(minSize, startPos.current.width - deltaX);
        newHeight = Math.max(minSize, startPos.current.height + deltaY);
        if (newWidth > minSize) newX = startPos.current.elemX + deltaX;
        break;
      case 'ne':
        newWidth = Math.max(minSize, startPos.current.width + deltaX);
        newHeight = Math.max(minSize, startPos.current.height - deltaY);
        if (newHeight > minSize) newY = startPos.current.elemY + deltaY;
        break;
      case 'nw':
        newWidth = Math.max(minSize, startPos.current.width - deltaX);
        newHeight = Math.max(minSize, startPos.current.height - deltaY);
        if (newWidth > minSize) newX = startPos.current.elemX + deltaX;
        if (newHeight > minSize) newY = startPos.current.elemY + deltaY;
        break;
      case 'n':
        newHeight = Math.max(minSize, startPos.current.height - deltaY);
        if (newHeight > minSize) newY = startPos.current.elemY + deltaY;
        break;
      case 's':
        newHeight = Math.max(minSize, startPos.current.height + deltaY);
        break;
      case 'e':
        newWidth = Math.max(minSize, startPos.current.width + deltaX);
        break;
      case 'w':
        newWidth = Math.max(minSize, startPos.current.width - deltaX);
        if (newWidth > minSize) newX = startPos.current.elemX + deltaX;
        break;
    }

    onUpdateSilentRef.current(elementIdRef.current, {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });
  }, [resizeHandle]); // stable — deps via refs

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setResizeHandle(null);
    onResizeEndRef.current();
  }, []); // stable

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (!isVisible) return null;

  const getCursor = (position: string): string => {
    switch (position) {
      case 'nw': case 'se': return 'nw-resize';
      case 'ne': case 'sw': return 'ne-resize';
      case 'n': case 's': return 'n-resize';
      case 'e': case 'w': return 'e-resize';
      default: return 'default';
    }
  };

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
      }}
    >
      {handles.map((handle) => (
        <div
          key={handle.position}
          className="absolute w-3 h-3 bg-primary border-2 border-background rounded-full shadow-elegant hover:scale-150 transition-all pointer-events-auto"
          style={{
            left: handle.x,
            top: handle.y,
            cursor: getCursor(handle.position),
            zIndex: 1000,
          }}
          onMouseDown={(e) => handleMouseDown(e, handle.position)}
        />
      ))}
    </div>
  );
};
