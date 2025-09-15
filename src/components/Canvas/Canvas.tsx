import { useRef, useState, useCallback, useEffect } from "react";
import { CanvasToolbar } from "./CanvasToolbar";
import { CanvasObject } from "./CanvasObject";
import { CanvasHeader } from "./CanvasHeader";
import { PropertyPanel } from "./PropertyPanel";
import { SelectionBox } from "./SelectionBox";
import { ResizeHandles } from "./ResizeHandles";
import { useCanvasInteraction } from "./hooks/useCanvasInteraction";
import { useSelection } from "./hooks/useSelection";

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
  opacity?: number;
  rotation?: number;
  locked?: boolean;
  zIndex?: number;
}

export const Canvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [selectedColor, setSelectedColor] = useState('#FFE066');
  const [boardTitle, setBoardTitle] = useState('Tableau sans titre');
  const [isPropertyPanelVisible, setIsPropertyPanelVisible] = useState(false);
  
  const {
    canvasTransform,
    isSpacePressed,
    handleMouseDown: canvasMouseDown,
    handleMouseMove: canvasMouseMove,
    handleMouseUp: canvasMouseUp,
    handleWheel,
  } = useCanvasInteraction(containerRef);

  const {
    selection,
    selectElement,
    selectMultiple,
    clearSelection,
    startSelectionBox,
    updateSelectionBox,
    endSelectionBox,
    isSelected,
  } = useSelection();

  // Mock collaborators data
  const collaborators = [
    { id: '1', name: 'Vous', avatar: '', color: '#6366F1' },
    { id: '2', name: 'Alice Martin', avatar: '', color: '#10B981' },
    { id: '3', name: 'Bob Dupont', avatar: '', color: '#F59E0B' },
  ];

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

  const handleElementDuplicate = useCallback((id: string) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;

    const newElement: CanvasElement = {
      ...element,
      id: `${element.type}-${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20,
    };
    
    setElements(prev => [...prev, newElement]);
  }, [elements]);

  // Enhanced selection and interaction handlers
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedTool === 'select' && !isSpacePressed) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale;
      const y = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale;

      // Start selection box
      startSelectionBox(x, y);
      clearSelection();
    } else {
      canvasMouseDown(e);
    }
  }, [selectedTool, isSpacePressed, canvasTransform, startSelectionBox, clearSelection, canvasMouseDown]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (selection.selectionBox.isActive) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale;
      const y = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale;
      
      updateSelectionBox(x, y);
    } else {
      canvasMouseMove(e);
    }
  }, [selection.selectionBox.isActive, canvasTransform, updateSelectionBox, canvasMouseMove]);

  const handleCanvasMouseUp = useCallback(() => {
    if (selection.selectionBox.isActive) {
      // Find elements within selection box
      const box = selection.selectionBox;
      const selectedElements = elements.filter(element => {
        const elementRight = element.x + element.width;
        const elementBottom = element.y + element.height;
        const boxLeft = Math.min(box.startX, box.endX);
        const boxTop = Math.min(box.startY, box.endY);
        const boxRight = Math.max(box.startX, box.endX);
        const boxBottom = Math.max(box.startY, box.endY);

        return (
          element.x < boxRight &&
          elementRight > boxLeft &&
          element.y < boxBottom &&
          elementBottom > boxTop
        );
      });

      selectMultiple(selectedElements.map(el => el.id));
      endSelectionBox();
    } else {
      canvasMouseUp();
    }
  }, [selection.selectionBox, elements, selectMultiple, endSelectionBox, canvasMouseUp]);

  const handleElementClick = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isMultiSelect = e.ctrlKey || e.metaKey;
    selectElement(id, isMultiSelect);
  }, [selectElement]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        selection.selectedIds.forEach(id => handleElementDelete(id));
        clearSelection();
      } else if (e.key === 'Escape') {
        clearSelection();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        selection.selectedIds.forEach(id => handleElementDuplicate(id));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection.selectedIds, handleElementDelete, handleElementDuplicate, clearSelection]);

  const selectedElements = elements.filter(el => isSelected(el.id));
  const cursor = isSpacePressed ? 'canvas-cursor-grabbing' : selectedTool === 'select' ? 'canvas-cursor-grab' : 'crosshair';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-canvas">
      {/* Header */}
      <CanvasHeader
        boardTitle={boardTitle}
        onTitleChange={setBoardTitle}
        collaborators={collaborators}
      />

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className={`absolute inset-0 pt-16 ${cursor}`}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
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

          {/* Selection Box */}
          <SelectionBox {...selection.selectionBox} />

          {/* Canvas Elements */}
          {elements.map(element => (
            <div key={element.id} className="relative">
              <CanvasObject
                element={element}
                onUpdate={handleElementUpdate}
                onDelete={handleElementDelete}
                onClick={handleElementClick}
                isSelected={isSelected(element.id)}
              />
              
              {/* Resize Handles */}
              {isSelected(element.id) && (
                <ResizeHandles
                  element={element}
                  onUpdate={handleElementUpdate}
                  isVisible={true}
                />
              )}
            </div>
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

      {/* Property Panel */}
      <PropertyPanel
        selectedElements={selectedElements}
        onUpdate={handleElementUpdate}
        onDelete={handleElementDelete}
        onDuplicate={handleElementDuplicate}
        isVisible={isPropertyPanelVisible}
        onToggle={() => setIsPropertyPanelVisible(!isPropertyPanelVisible)}
      />

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-card/95 backdrop-blur-sm rounded-lg border border-border p-2 shadow-float">
        <button 
          className="w-10 h-10 rounded-md bg-muted hover:bg-tool-hover flex items-center justify-center transition-colors"
          onClick={() => {
            // TODO: Implement zoom in
          }}
        >
          <span className="text-lg font-medium">+</span>
        </button>
        <div className="text-xs text-center text-muted-foreground py-1">
          {Math.round(canvasTransform.scale * 100)}%
        </div>
        <button 
          className="w-10 h-10 rounded-md bg-muted hover:bg-tool-hover flex items-center justify-center transition-colors"
          onClick={() => {
            // TODO: Implement zoom out
          }}
        >
          <span className="text-lg font-medium">−</span>
        </button>
      </div>
    </div>
  );
};