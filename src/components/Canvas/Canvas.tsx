import { useRef, useState, useCallback, useEffect } from "react";
import { CanvasToolbar } from "./CanvasToolbar";
import { CanvasObject } from "./CanvasObject";
import { useCanvasInteraction } from "./hooks/useCanvasInteraction";

export interface CanvasElement {
  id: string;
  type: 'sticky' | 'text' | 'rectangle' | 'circle' | 'arrow';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  content?: string;
  fontSize?: number;
  borderRadius?: number;
}

export const Canvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [selectedColor, setSelectedColor] = useState('#FFE066');
  
  const {
    canvasTransform,
    isSpacePressed,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
  } = useCanvasInteraction(containerRef);

  const handleAddElement = useCallback((type: CanvasElement['type']) => {
    const newElement: CanvasElement = {
      id: `${type}-${Date.now()}`,
      type,
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      width: type === 'sticky' ? 200 : type === 'circle' ? 120 : 160,
      height: type === 'sticky' ? 200 : type === 'circle' ? 120 : 100,
      color: selectedColor,
      content: type === 'sticky' ? 'Nouvelle idée...' : type === 'text' ? 'Tapez votre texte' : '',
      fontSize: type === 'text' ? 16 : 14,
      borderRadius: type === 'rectangle' ? 8 : 0,
    };
    
    setElements(prev => [...prev, newElement]);
  }, [selectedColor]);

  const handleElementUpdate = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  }, []);

  const handleElementDelete = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // TODO: Delete selected elements
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cursor = isSpacePressed ? 'canvas-cursor-grabbing' : selectedTool === 'select' ? 'canvas-cursor-grab' : 'crosshair';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-canvas">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">CollabBoard</h1>
            <div className="text-sm text-muted-foreground">Tableau sans titre</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-medium">
                U
              </div>
              <span className="text-sm text-muted-foreground">Vous</span>
            </div>
          </div>
        </div>
      </header>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className={`absolute inset-0 pt-16 ${cursor}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: cursor === 'canvas-cursor-grab' ? 'grab' : cursor === 'canvas-cursor-grabbing' ? 'grabbing' : cursor }}
      >
        {/* Canvas Content */}
        <div
          className="relative origin-top-left transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`,
            width: '4000px',
            height: '4000px',
          }}
        >
          {/* Grid Background */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.3) 1px, transparent 0)
              `,
              backgroundSize: '20px 20px',
            }}
          />

          {/* Canvas Elements */}
          {elements.map(element => (
            <CanvasObject
              key={element.id}
              element={element}
              onUpdate={handleElementUpdate}
              onDelete={handleElementDelete}
              isSelected={false}
            />
          ))}
        </div>
      </div>

      {/* Floating Toolbar */}
      <CanvasToolbar
        selectedTool={selectedTool}
        selectedColor={selectedColor}
        onToolSelect={setSelectedTool}
        onColorSelect={setSelectedColor}
        onAddElement={handleAddElement}
      />

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-card/95 backdrop-blur-sm rounded-lg border border-border p-2 shadow-float">
        <button className="w-10 h-10 rounded-md bg-muted hover:bg-tool-hover flex items-center justify-center transition-colors">
          <span className="text-lg font-medium">+</span>
        </button>
        <div className="text-xs text-center text-muted-foreground py-1">
          {Math.round(canvasTransform.scale * 100)}%
        </div>
        <button className="w-10 h-10 rounded-md bg-muted hover:bg-tool-hover flex items-center justify-center transition-colors">
          <span className="text-lg font-medium">−</span>
        </button>
      </div>
    </div>
  );
};