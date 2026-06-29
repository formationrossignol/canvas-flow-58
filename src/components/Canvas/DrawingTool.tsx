import { useRef, useState, useCallback } from "react";

export interface DrawingStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  thickness: number;
}

interface DrawingToolProps {
  strokes: DrawingStroke[];
  onAddStroke: (stroke: DrawingStroke) => void;
  onRemoveStroke?: (id: string) => void;
  isActive: boolean;
  isErasing?: boolean;
  color: string;
  thickness: number;
  canvasTransform: { x: number; y: number; scale: number };
}

export const DrawingTool = ({
  strokes,
  onAddStroke,
  onRemoveStroke,
  isActive,
  isErasing,
  color,
  thickness,
  canvasTransform,
}: DrawingToolProps) => {
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;
  const onRemoveStrokeRef = useRef(onRemoveStroke);
  onRemoveStrokeRef.current = onRemoveStroke;

  const getMousePosition = useCallback((e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasTransform.scale;
    const y = (e.clientY - rect.top) / canvasTransform.scale;
    
    return { x, y };
  }, [canvasTransform]);

  const eraseNearPoint = useCallback((cx: number, cy: number) => {
    const ERASE_RADIUS = 20;
    strokesRef.current.forEach(stroke => {
      const hit = stroke.points.some(p => Math.hypot(p.x - cx, p.y - cy) < ERASE_RADIUS);
      if (hit) onRemoveStrokeRef.current?.(stroke.id);
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isActive && !isErasing) return;
    e.stopPropagation();

    if (isErasing) {
      const point = getMousePosition(e);
      eraseNearPoint(point.x, point.y);
      setIsDrawing(true);
      return;
    }

    setIsDrawing(true);
    const point = getMousePosition(e);
    const newStroke: DrawingStroke = {
      id: `stroke-${Date.now()}`,
      points: [point],
      color,
      thickness,
    };
    setCurrentStroke(newStroke);
  }, [isActive, isErasing, getMousePosition, color, thickness, eraseNearPoint]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing) return;

    if (isErasing) {
      const point = getMousePosition(e);
      eraseNearPoint(point.x, point.y);
      return;
    }

    if (!currentStroke) return;
    const point = getMousePosition(e);
    setCurrentStroke(prev => prev ? {
      ...prev,
      points: [...prev.points, point]
    } : null);
  }, [isDrawing, isErasing, currentStroke, getMousePosition, eraseNearPoint]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentStroke) return;
    
    setIsDrawing(false);
    onAddStroke(currentStroke);
    setCurrentStroke(null);
  }, [isDrawing, currentStroke, onAddStroke]);

  const strokeToPath = (stroke: DrawingStroke) => {
    if (stroke.points.length < 2) return '';
    
    let path = `M ${stroke.points[0].x} ${stroke.points[0].y}`;
    
    for (let i = 1; i < stroke.points.length; i++) {
      const point = stroke.points[i];
      path += ` L ${point.x} ${point.y}`;
    }
    
    return path;
  };

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        width: '4000px',
        height: '4000px',
        pointerEvents: (isActive || isErasing) ? 'auto' : 'none',
        cursor: isErasing ? 'cell' : 'crosshair',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Existing strokes */}
      {strokes.map(stroke => (
        <path
          key={stroke.id}
          d={strokeToPath(stroke)}
          stroke={stroke.color}
          strokeWidth={stroke.thickness}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ))}
      
      {/* Current stroke being drawn */}
      {currentStroke && (
        <path
          d={strokeToPath(currentStroke)}
          stroke={currentStroke.color}
          strokeWidth={currentStroke.thickness}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}
    </svg>
  );
};
