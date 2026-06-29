import React, { useState, useCallback, useRef } from "react";
import { CanvasElement } from "./Canvas";

type HandlePosition = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

interface ResizeHandlesProps {
  element: CanvasElement;
  onUpdateSilent: (id: string, updates: Partial<CanvasElement>) => void;
  onResizeEnd: () => void;
  canvasTransform: { x: number; y: number; scale: number };
  containerRef: React.RefObject<HTMLDivElement>;
  containerPaddingTop: number;
}

// Handle is rendered in screen space (position: fixed), always 10×10px.
const HANDLE_SIZE = 10;
const HALF = HANDLE_SIZE / 2;
const OFFSET = 8; // screen pixels outside element edge

export const ResizeHandles = ({
  element,
  onUpdateSilent,
  onResizeEnd,
  canvasTransform,
  containerRef,
  containerPaddingTop,
}: ResizeHandlesProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<HandlePosition | null>(null);

  const startPos = useRef({
    mouseX: 0, mouseY: 0,
    width: 0, height: 0, elemX: 0, elemY: 0,
    scale: 1,
  });

  const onUpdateSilentRef = useRef(onUpdateSilent);
  onUpdateSilentRef.current = onUpdateSilent;
  const onResizeEndRef = useRef(onResizeEnd);
  onResizeEndRef.current = onResizeEnd;
  const elementIdRef = useRef(element.id);
  elementIdRef.current = element.id;

  const handleMouseDown = useCallback((e: React.MouseEvent, pos: HandlePosition) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeHandle(pos);
    startPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: element.width,
      height: element.height,
      elemX: element.x,
      elemY: element.y,
      scale: canvasTransform.scale,
    };
  }, [element.width, element.height, element.x, element.y, canvasTransform.scale]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizeHandle) return;

    const scale = startPos.current.scale;
    const deltaX = (e.clientX - startPos.current.mouseX) / scale;
    const deltaY = (e.clientY - startPos.current.mouseY) / scale;
    const minSize = 20;
    let newWidth = startPos.current.width;
    let newHeight = startPos.current.height;
    let newX = startPos.current.elemX;
    let newY = startPos.current.elemY;

    switch (resizeHandle) {
      case 'se':
        newWidth  = Math.max(minSize, startPos.current.width  + deltaX);
        newHeight = Math.max(minSize, startPos.current.height + deltaY);
        break;
      case 'sw':
        newWidth  = Math.max(minSize, startPos.current.width  - deltaX);
        newHeight = Math.max(minSize, startPos.current.height + deltaY);
        if (newWidth  > minSize) newX = startPos.current.elemX + deltaX;
        break;
      case 'ne':
        newWidth  = Math.max(minSize, startPos.current.width  + deltaX);
        newHeight = Math.max(minSize, startPos.current.height - deltaY);
        if (newHeight > minSize) newY = startPos.current.elemY + deltaY;
        break;
      case 'nw':
        newWidth  = Math.max(minSize, startPos.current.width  - deltaX);
        newHeight = Math.max(minSize, startPos.current.height - deltaY);
        if (newWidth  > minSize) newX = startPos.current.elemX + deltaX;
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
        newWidth  = Math.max(minSize, startPos.current.width  + deltaX);
        break;
      case 'w':
        newWidth  = Math.max(minSize, startPos.current.width  - deltaX);
        if (newWidth  > minSize) newX = startPos.current.elemX + deltaX;
        break;
    }

    onUpdateSilentRef.current(elementIdRef.current, { x: newX, y: newY, width: newWidth, height: newHeight });
  }, [resizeHandle]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setResizeHandle(null);
    onResizeEndRef.current();
  }, []);

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

  const containerRect = containerRef.current?.getBoundingClientRect();
  if (!containerRect) return null;

  const { x: tx, y: ty, scale } = canvasTransform;

  // Element corners in screen coordinates (ty is canvas pan; paddingTop = canvas-content natural top offset)
  const sx = containerRect.left + tx + element.x * scale;
  const sy = containerRect.top  + containerPaddingTop + ty + element.y * scale;
  const sw = element.width  * scale;
  const sh = element.height * scale;

  const handles: { position: HandlePosition; left: number; top: number; cursor: string }[] = [
    { position: 'nw', left: sx - OFFSET - HALF,       top: sy - OFFSET - HALF,      cursor: 'nw-resize' },
    { position: 'ne', left: sx + sw + OFFSET - HALF,  top: sy - OFFSET - HALF,      cursor: 'ne-resize' },
    { position: 'sw', left: sx - OFFSET - HALF,       top: sy + sh + OFFSET - HALF, cursor: 'ne-resize' },
    { position: 'se', left: sx + sw + OFFSET - HALF,  top: sy + sh + OFFSET - HALF, cursor: 'nw-resize' },
    { position: 'n',  left: sx + sw / 2 - HALF,       top: sy - OFFSET - HALF,      cursor: 'n-resize'  },
    { position: 's',  left: sx + sw / 2 - HALF,       top: sy + sh + OFFSET - HALF, cursor: 'n-resize'  },
    { position: 'e',  left: sx + sw + OFFSET - HALF,  top: sy + sh / 2 - HALF,      cursor: 'e-resize'  },
    { position: 'w',  left: sx - OFFSET - HALF,       top: sy + sh / 2 - HALF,      cursor: 'e-resize'  },
  ];

  return (
    <>
      {handles.map(h => (
        <div
          key={h.position}
          onMouseDown={e => handleMouseDown(e, h.position)}
          style={{
            position: 'fixed',
            left: h.left,
            top: h.top,
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            cursor: h.cursor,
            zIndex: 1000,
            background: 'white',
            border: '2px solid hsl(var(--primary))',
            borderRadius: 2,
            boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'hsl(var(--primary))')}
          onMouseLeave={e => (e.currentTarget.style.background = 'white')}
        />
      ))}
    </>
  );
};
