import { useRef, useEffect } from "react";
import { CanvasElement } from "./Canvas";

interface MiniMapProps {
  elements: CanvasElement[];
  canvasTransform: { x: number; y: number; scale: number };
  onNavigate: (x: number, y: number) => void;
  onZoomChange?: (scale: number) => void;
}

export const MiniMap = ({ elements, canvasTransform, onNavigate, onZoomChange }: MiniMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const miniMapSize = 150;
  const worldSize = 8000; // Same as main canvas
  const scale = miniMapSize / worldSize;

  const handleZoomIn = () => {
    if (onZoomChange) {
      onZoomChange(Math.min(canvasTransform.scale * 1.2, 3));
    }
  };

  const handleZoomOut = () => {
    if (onZoomChange) {
      onZoomChange(Math.max(canvasTransform.scale * 0.8, 0.1));
    }
  };

  const handleZoomReset = () => {
    if (onZoomChange) {
      onZoomChange(1);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, miniMapSize, miniMapSize);

    // Draw grid
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= miniMapSize; i += 20 * scale) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, miniMapSize);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(miniMapSize, i);
      ctx.stroke();
    }

    // Draw elements
    elements.forEach(element => {
      const x = element.x * scale;
      const y = element.y * scale;
      const width = element.width * scale;
      const height = element.height * scale;

      ctx.fillStyle = element.color || '#666';
      ctx.fillRect(x, y, Math.max(2, width), Math.max(2, height));
    });

    // Draw viewport
    const viewportWidth = (window.innerWidth / canvasTransform.scale) * scale;
    const viewportHeight = (window.innerHeight / canvasTransform.scale) * scale;
    const viewportX = (-canvasTransform.x / canvasTransform.scale) * scale;
    const viewportY = (-canvasTransform.y / canvasTransform.scale) * scale;

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);
    
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.fillRect(viewportX, viewportY, viewportWidth, viewportHeight);
  }, [elements, canvasTransform, scale]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Convert minimap coordinates to world coordinates
    const worldX = (clickX / scale) * canvasTransform.scale;
    const worldY = (clickY / scale) * canvasTransform.scale;
    
    // Center the viewport on the clicked position
    const newX = -(worldX - window.innerWidth / 2);
    const newY = -(worldY - window.innerHeight / 2);
    
    onNavigate(newX, newY);
  };

  return (
    <div 
      ref={containerRef}
      className="absolute bottom-6 right-6 z-10 bg-card/95 backdrop-blur-sm rounded-lg border border-border p-3 shadow-float space-y-3"
    >
      {/* Zoom Controls */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground">Zoom</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors font-medium"
          >
            -
          </button>
          <div className="flex-1 text-center text-xs font-medium text-muted-foreground">
            {Math.round(canvasTransform.scale * 100)}%
          </div>
          <button
            onClick={handleZoomIn}
            className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors font-medium"
          >
            +
          </button>
        </div>
        <button
          onClick={handleZoomReset}
          className="w-full px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors font-medium"
        >
          Réinitialiser
        </button>
      </div>

      {/* Mini Map */}
      <div>
        <h4 className="text-xs font-medium text-muted-foreground mb-2">Mini carte</h4>
        <canvas
          ref={canvasRef}
          width={miniMapSize}
          height={miniMapSize}
          className="border border-border rounded cursor-pointer hover:border-primary transition-colors"
          onClick={handleClick}
        />
      </div>
    </div>
  );
};