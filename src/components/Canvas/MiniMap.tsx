import { useRef, useEffect } from "react";
import { CanvasElement } from "./Canvas";

interface MiniMapProps {
  elements: CanvasElement[];
  canvasTransform: { x: number; y: number; scale: number };
  onNavigate: (x: number, y: number) => void;
  onZoomChange?: (scale: number) => void;
  onFitToScreen?: () => void;
}

const MAP_W = 160;
const MAP_H = 100;
const WORLD = 8000;

export const MiniMap = ({ elements, canvasTransform, onNavigate, onZoomChange, onFitToScreen }: MiniMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scaleX = MAP_W / WORLD;
  const scaleY = MAP_H / WORLD;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#F1F3F6';
    ctx.fillRect(0, 0, MAP_W, MAP_H);

    elements.forEach(el => {
      ctx.fillStyle = el.color || '#9CA3AF';
      ctx.globalAlpha = 0.7;
      const x = el.x * scaleX;
      const y = el.y * scaleY;
      const w = Math.max(2, el.width * scaleX);
      const h = Math.max(2, el.height * scaleY);
      ctx.beginPath();
      if ('roundRect' in ctx) (ctx as any).roundRect(x, y, w, h, 1);
      else ctx.rect(x, y, w, h);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    const vw = (window.innerWidth / canvasTransform.scale) * scaleX;
    const vh = (window.innerHeight / canvasTransform.scale) * scaleY;
    const vx = (-canvasTransform.x / canvasTransform.scale) * scaleX;
    const vy = (-canvasTransform.y / canvasTransform.scale) * scaleY;

    ctx.fillStyle = 'rgba(99,102,241,0.08)';
    ctx.fillRect(vx, vy, vw, vh);
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(vx, vy, vw, vh);
  }, [elements, canvasTransform, scaleX, scaleY]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const wx = ((e.clientX - rect.left) / scaleX) * canvasTransform.scale;
    const wy = ((e.clientY - rect.top) / scaleY) * canvasTransform.scale;
    onNavigate(-(wx - window.innerWidth / 2), -(wy - window.innerHeight / 2));
  };

  const zoomPct = Math.round(canvasTransform.scale * 100);

  const btnBase: React.CSSProperties = {
    width: 24, height: 24, borderRadius: 6,
    background: 'rgba(15,23,42,0.05)', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#374151', fontSize: 18, fontWeight: 300, lineHeight: 1, fontFamily: 'inherit',
  };

  return (
    <div style={{
      position: 'absolute', bottom: 24, right: 24, zIndex: 40,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {/* Zoom bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(15,23,42,0.07)',
        borderRadius: 10, padding: '5px 8px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      }}>
        <button style={btnBase} onClick={() => onZoomChange?.(Math.max(canvasTransform.scale * 0.8, 0.1))}>−</button>
        <button
          onClick={() => onZoomChange?.(1)}
          style={{
            minWidth: 44, height: 24, borderRadius: 6,
            background: 'rgba(99,102,241,0.08)', border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, color: '#6366F1', fontFamily: 'inherit', letterSpacing: '-0.2px',
          }}
        >
          {zoomPct}%
        </button>
        <button style={btnBase} onClick={() => onZoomChange?.(Math.min(canvasTransform.scale * 1.2, 3))}>+</button>
        <div style={{ width: 1, height: 16, background: 'rgba(15,23,42,0.08)', margin: '0 2px' }} />
        <button
          onClick={onFitToScreen}
          style={{
            height: 24, padding: '0 7px', borderRadius: 6,
            background: 'rgba(15,23,42,0.04)', border: 'none', cursor: 'pointer',
            fontSize: 11, fontWeight: 600, color: '#6B7280', fontFamily: 'inherit',
            whiteSpace: 'nowrap', letterSpacing: '-0.1px',
          }}
        >
          Tout voir
        </button>
      </div>

      {/* Minimap */}
      <div style={{
        background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(15,23,42,0.07)',
        borderRadius: 10, overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      }}>
        <div style={{
          padding: '7px 10px 5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Carte</span>
          <span style={{ fontSize: 11, color: '#D1D5DB' }}>{elements.length}×</span>
        </div>
        <canvas
          ref={canvasRef}
          width={MAP_W}
          height={MAP_H}
          style={{ display: 'block', cursor: 'grab' }}
          onClick={handleClick}
        />
      </div>
    </div>
  );
};
