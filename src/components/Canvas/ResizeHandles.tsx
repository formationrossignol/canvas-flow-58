import React, { useState, useCallback, useRef } from "react";
import { CanvasElement } from "./Canvas";

interface ResizeHandle {
  position: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
  x: number;
  y: number;
}

interface ResizeHandlesProps {
  element: CanvasElement;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  isVisible: boolean;
}

export const ResizeHandles = ({ element, onUpdate, isVisible }: ResizeHandlesProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });

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
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height,
    };
  }, [element.width, element.height]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeHandle) return;

    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;

    let newWidth = startPos.current.width;
    let newHeight = startPos.current.height;
    let newX = element.x;
    let newY = element.y;

    // Minimum size constraints
    const minSize = 20;

    switch (resizeHandle) {
      case 'se': // Bottom-right
        newWidth = Math.max(minSize, startPos.current.width + deltaX);
        newHeight = Math.max(minSize, startPos.current.height + deltaY);
        break;
      case 'sw': // Bottom-left
        newWidth = Math.max(minSize, startPos.current.width - deltaX);
        newHeight = Math.max(minSize, startPos.current.height + deltaY);
        if (newWidth > minSize) newX = element.x + deltaX;
        break;
      case 'ne': // Top-right
        newWidth = Math.max(minSize, startPos.current.width + deltaX);
        newHeight = Math.max(minSize, startPos.current.height - deltaY);
        if (newHeight > minSize) newY = element.y + deltaY;
        break;
      case 'nw': // Top-left
        newWidth = Math.max(minSize, startPos.current.width - deltaX);
        newHeight = Math.max(minSize, startPos.current.height - deltaY);
        if (newWidth > minSize) newX = element.x + deltaX;
        if (newHeight > minSize) newY = element.y + deltaY;
        break;
      case 'n': // Top
        newHeight = Math.max(minSize, startPos.current.height - deltaY);
        if (newHeight > minSize) newY = element.y + deltaY;
        break;
      case 's': // Bottom
        newHeight = Math.max(minSize, startPos.current.height + deltaY);
        break;
      case 'e': // Right
        newWidth = Math.max(minSize, startPos.current.width + deltaX);
        break;
      case 'w': // Left
        newWidth = Math.max(minSize, startPos.current.width - deltaX);
        if (newWidth > minSize) newX = element.x + deltaX;
        break;
    }

    onUpdate(element.id, {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });
  }, [isResizing, resizeHandle, element, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  // Attach global mouse events when resizing
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
      case 'nw':
      case 'se':
        return 'nw-resize';
      case 'ne':
      case 'sw':
        return 'ne-resize';
      case 'n':
      case 's':
        return 'n-resize';
      case 'e':
      case 'w':
        return 'e-resize';
      default:
        return 'default';
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