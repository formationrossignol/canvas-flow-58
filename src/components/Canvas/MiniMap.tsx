import { useRef, useEffect } from "react";
import { CanvasElement } from "./Canvas";

interface MiniMapProps {
  elements: CanvasElement[];
  canvasTransform: { x: number; y: number; scale: number };
  onNavigate: (x: number, y: number) => void;
}

export const MiniMap = ({ elements, canvasTransform, onNavigate }: MiniMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const miniMapSize = 150;
  const worldSize = 8000; // Same as main canvas
  const scale = miniMapSize / worldSize;

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
      className="absolute bottom-6 right-6 z-50 bg-card/95 backdrop-blur-sm rounded-lg border border-border p-3 shadow-float"
      style={{ marginBottom: '80px' }} // Space for zoom controls
    >
      <h4 className="text-xs font-medium text-muted-foreground mb-2">Mini carte</h4>
      <canvas
        ref={canvasRef}
        width={miniMapSize}
        height={miniMapSize}
        className="border border-border rounded cursor-pointer hover:border-primary transition-colors"
        onClick={handleClick}
      />
    </div>
  );
};