import { useRef, useState, useCallback, useEffect } from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CanvasToolbar } from "./CanvasToolbar";
import { CanvasObject } from "./CanvasObject";
import { CanvasHeader } from "./CanvasHeader";
import { SelectionBox } from "./SelectionBox";
import { OptionsMenu } from "./OptionsMenu";
import { InlineEditor } from "./InlineEditor";
import { ResizeHandles } from "./ResizeHandles";
import { TemplatePanel } from "./TemplatePanel";
import { ShapeLibrary } from "./ShapeLibrary";
import { ExportImportModal } from "./ExportImportModal";
import { CommentsList } from "./CommentsList";
import { ConnectionSystem, Connection } from "./ConnectionSystem";
import { DrawingTool, DrawingStroke } from "./DrawingTool";
import { Timer } from "./Timer";
import { MiniMap } from "./MiniMap";
import { TextEditor } from "./TextEditor";
import { useCanvasInteraction } from "./hooks/useCanvasInteraction";
import { useSelection } from "./hooks/useSelection";
import { useHistory } from "./hooks/useHistory";
import { templates } from "./templates";

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
}

export interface CanvasElement {
  id: string;
  type: 'sticky' | 'text' | 'rectangle' | 'circle' | 'triangle' | 'hexagon' | 'pentagon' | 'star' | 'diamond' | 'heart' | 'arrow' | 'image' | 'comment';
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
  imageUrl?: string;
  textStyle?: React.CSSProperties;
  likedBy?: string[];
  comments?: Comment[];
}

interface CanvasProps {
  boardId?: string;
  templateId?: string | null;
}

export const Canvas = ({ boardId, templateId }: CanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [pendingElement, setPendingElement] = useState<CanvasElement['type'] | null>(null);
  
  // History management
  const { addToHistory, undo, redo, canUndo, canRedo } = useHistory(elements);
  const [selectedColor, setSelectedColor] = useState('#FFE066');
  const [boardTitle, setBoardTitle] = useState('Tableau sans titre');
  const [isOptionsMenuVisible, setIsOptionsMenuVisible] = useState(false);
  const [editingElement, setEditingElement] = useState<{element: CanvasElement, position: {x: number, y: number}} | null>(null);
  const [isTemplatePanelVisible, setIsTemplatePanelVisible] = useState(false);
  const [isShapeLibraryVisible, setIsShapeLibraryVisible] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isCommentsListVisible, setIsCommentsListVisible] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [drawingStrokes, setDrawingStrokes] = useState<DrawingStroke[]>([]);
  const [brushThickness, setBrushThickness] = useState(3);
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [isTextEditorVisible, setIsTextEditorVisible] = useState(false);
  const [textStyle, setTextStyle] = useState({});
  
  const {
    canvasTransform,
    isSpacePressed,
    handleMouseDown: canvasMouseDown,
    handleMouseMove: canvasMouseMove,
    handleMouseUp: canvasMouseUp,
    handleWheel,
    setCanvasTransform,
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
    if (type === 'image') {
      // Trigger file input for image upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const imageUrl = event.target?.result as string;
            setPendingElement(type);
            // Store imageUrl temporarily
            (window as any).__pendingImageUrl = imageUrl;
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }

    // Set pending element instead of creating immediately
    setPendingElement(type);
  }, [selectedColor]);

  const createElementAtPosition = useCallback((type: CanvasElement['type'], x: number, y: number) => {
    const newElement: CanvasElement = {
      id: `${type}-${Date.now()}`,
      type,
      x,
      y,
      width: type === 'sticky' ? 200 : 
             type === 'circle' ? 120 : 
             type === 'comment' ? 300 :
             ['triangle', 'hexagon', 'pentagon', 'star', 'diamond', 'heart'].includes(type) ? 120 : 160,
      height: type === 'sticky' ? 200 : 
              type === 'circle' ? 120 : 
              type === 'comment' ? 150 :
              ['triangle', 'hexagon', 'pentagon', 'star', 'diamond', 'heart'].includes(type) ? 120 : 100,
      color: selectedColor,
      content: type === 'sticky' ? 'Nouvelle idée...' : 
               type === 'text' ? 'Tapez votre texte' : 
               type === 'comment' ? '' : '',
      fontSize: type === 'text' ? 16 : 14,
      borderRadius: type === 'rectangle' ? 8 : type === 'comment' ? 12 : 0,
      imageUrl: type === 'image' ? (window as any).__pendingImageUrl : undefined,
      comments: type === 'comment' ? [] : undefined,
    };
    
    if (type === 'image') {
      delete (window as any).__pendingImageUrl;
    }
    
    setElements(prev => {
      const newElements = [...prev, newElement];
      addToHistory(newElements);
      return newElements;
    });
    
    setPendingElement(null);
  }, [selectedColor, addToHistory]);

  const handleElementUpdate = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements(prev => {
      const newElements = prev.map(el => el.id === id ? { ...el, ...updates } : el);
      addToHistory(newElements);
      return newElements;
    });
  }, [addToHistory]);

  const handleElementDelete = useCallback((id: string) => {
    setElements(prev => {
      const newElements = prev.filter(el => el.id !== id);
      addToHistory(newElements);
      return newElements;
    });
    
    // Also remove connections related to this element
    setConnections(prev => 
      prev.filter(conn => 
        conn.fromElementId !== id && conn.toElementId !== id
      )
    );
  }, [addToHistory]);

  const handleElementDuplicate = useCallback((id: string) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;

    const newElement: CanvasElement = {
      ...element,
      id: `${element.type}-${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20,
      likedBy: [], // Reset likes for duplicated element
    };
    
    setElements(prev => {
      const newElements = [...prev, newElement];
      addToHistory(newElements);
      return newElements;
    });
  }, [elements, addToHistory]);

  const handleLockSelectedElements = useCallback(() => {
    if (selection.selectedIds.length === 0) return;
    
    setElements(prev => {
      const newElements = prev.map(el => 
        selection.selectedIds.includes(el.id) 
          ? { ...el, locked: true }
          : el
      );
      addToHistory(newElements);
      return newElements;
    });
  }, [selection.selectedIds, addToHistory]);

  const handleUnlockSelectedElements = useCallback(() => {
    if (selection.selectedIds.length === 0) return;
    
    setElements(prev => {
      const newElements = prev.map(el => 
        selection.selectedIds.includes(el.id) 
          ? { ...el, locked: false }
          : el
      );
      addToHistory(newElements);
      return newElements;
    });
  }, [selection.selectedIds, addToHistory]);

  const handleDuplicateSelectedElements = useCallback(() => {
    if (selection.selectedIds.length === 0) return;
    
    const newElements: CanvasElement[] = [];
    selection.selectedIds.forEach(id => {
      const element = elements.find(el => el.id === id);
      if (element) {
        const newElement: CanvasElement = {
          ...element,
          id: `${element.type}-${Date.now()}-${Math.random()}`,
          x: element.x + 20,
          y: element.y + 20,
          likedBy: [], // Reset likes for duplicated element
        };
        newElements.push(newElement);
      }
    });
    
    if (newElements.length > 0) {
      setElements(prev => {
        const updated = [...prev, ...newElements];
        addToHistory(updated);
        return updated;
      });
      // Select the newly duplicated elements
      selectMultiple(newElements.map(el => el.id));
    }
  }, [selection.selectedIds, elements, addToHistory, selectMultiple]);

  const handleApplyTemplate = useCallback((templateElements: CanvasElement[]) => {
    setElements(templateElements);
    addToHistory(templateElements);
    clearSelection();
  }, [clearSelection, addToHistory]);

  const handleImportElements = useCallback((importedElements: CanvasElement[]) => {
    setElements(importedElements);
    addToHistory(importedElements);
    clearSelection();
  }, [clearSelection, addToHistory]);

  // Enhanced selection and interaction handlers
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // If we have a pending element, create it at click position
    if (pendingElement && !isSpacePressed) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale;
      const y = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale;

      createElementAtPosition(pendingElement, x, y);
      return;
    }

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
  }, [pendingElement, selectedTool, isSpacePressed, canvasTransform, createElementAtPosition, startSelectionBox, clearSelection, canvasMouseDown]);

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
    
    // Just select the element, don't open editor on click
    selectElement(id, isMultiSelect);
  }, [selectElement]);

  // Load template if templateId is provided
  useEffect(() => {
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template && template.elements.length > 0) {
        setElements(template.elements);
        addToHistory(template.elements);
      }
    }
  }, [templateId, addToHistory]);

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
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const prevElements = undo();
        if (prevElements) {
          setElements(prevElements);
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        const nextElements = redo();
        if (nextElements) {
          setElements(nextElements);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection.selectedIds, handleElementDelete, handleElementDuplicate, clearSelection, undo, redo]);

  const selectedElements = elements.filter(el => isSelected(el.id));
  const cursor = pendingElement 
    ? 'crosshair' 
    : isSpacePressed 
    ? 'canvas-cursor-grabbing' 
    : selectedTool === 'select' 
    ? 'canvas-cursor-grab' 
    : selectedTool === 'pen' 
    ? 'crosshair' 
    : 'crosshair';

  const handleAddStroke = useCallback((stroke: DrawingStroke) => {
    setDrawingStrokes(prev => [...prev, stroke]);
  }, []);

  const handleExportPDF = useCallback(async (exportOnlySelected = false) => {
    if (!containerRef.current) return;

    const canvasContent = containerRef.current.querySelector('[style*="transform"]') as HTMLElement;
    if (!canvasContent) return;

    try {
      // Temporarily reset transform for capture
      const originalTransform = canvasContent.style.transform;
      canvasContent.style.transform = 'translate(0px, 0px) scale(1)';
      
      // Determine which elements to export
      const elementsToExport = exportOnlySelected && selection.selectedIds.length > 0
        ? elements.filter(el => selection.selectedIds.includes(el.id))
        : elements;

      if (elementsToExport.length === 0) {
        console.warn('Aucun élément à exporter');
        canvasContent.style.transform = originalTransform;
        return;
      }
      
      // Calculate visible area based on elements to export
      const elementBounds = elementsToExport.reduce((bounds, element) => {
        return {
          minX: Math.min(bounds.minX, element.x),
          minY: Math.min(bounds.minY, element.y),
          maxX: Math.max(bounds.maxX, element.x + element.width),
          maxY: Math.max(bounds.maxY, element.y + element.height),
        };
      }, { 
        minX: elementsToExport[0].x, 
        minY: elementsToExport[0].y, 
        maxX: elementsToExport[0].x + elementsToExport[0].width, 
        maxY: elementsToExport[0].y + elementsToExport[0].height 
      });

      // Add padding
      const padding = 50;
      const captureWidth = Math.max(400, elementBounds.maxX - elementBounds.minX + padding * 2);
      const captureHeight = Math.max(300, elementBounds.maxY - elementBounds.minY + padding * 2);

      const canvas = await html2canvas(canvasContent, {
        x: Math.max(0, elementBounds.minX - padding),
        y: Math.max(0, elementBounds.minY - padding),
        width: captureWidth,
        height: captureHeight,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      // Restore original transform
      canvasContent.style.transform = originalTransform;

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: captureWidth > captureHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [captureWidth, captureHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, captureWidth, captureHeight);
      const fileName = exportOnlySelected ? `${boardTitle || 'board'}-selection.pdf` : `${boardTitle || 'board'}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
    }
  }, [elements, boardTitle, selection.selectedIds]);

  const handleExportSelectedArea = useCallback(() => {
    handleExportPDF(true);
  }, [handleExportPDF]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-canvas">
      {/* Header */}
      <CanvasHeader
        boardTitle={boardTitle}
        onTitleChange={setBoardTitle}
        collaborators={collaborators}
        onOpenTemplates={() => setIsTemplatePanelVisible(true)}
        onOpenExport={() => setIsExportModalVisible(true)}
        onOpenComments={() => setIsCommentsListVisible(true)}
        selectedCount={selection.selectedIds.length}
        onLockSelected={handleLockSelectedElements}
        onUnlockSelected={handleUnlockSelectedElements}
        onDuplicateSelected={handleDuplicateSelectedElements}
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
          className="absolute inset-0 bg-canvas"
          style={{
            transform: `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`,
            width: '20000px',
            height: '20000px',
          }}
        >
          {/* Grid Background with primary color */}
          <div 
            className="absolute"
            style={{
              left: '-20000px',
              top: '-20000px',
              width: '60000px',
              height: '60000px',
              backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              backgroundPosition: `${canvasTransform.x % 32}px ${canvasTransform.y % 32}px`,
            }}
          />

          {/* Drawing Tool */}
          <DrawingTool
            strokes={drawingStrokes}
            onAddStroke={handleAddStroke}
            isActive={selectedTool === 'pen'}
            color={selectedColor}
            thickness={brushThickness}
            canvasTransform={canvasTransform}
          />

          {/* Connection System */}
          <ConnectionSystem
            elements={elements}
            connections={connections}
            onUpdateConnections={setConnections}
            canvasTransform={canvasTransform}
            isConnecting={isConnecting}
            setIsConnecting={setIsConnecting}
          />

          {/* Selection Box */}
          <SelectionBox {...selection.selectionBox} />

          {/* Canvas Elements */}
          {elements.map(element => (
            <CanvasObject
              key={element.id}
              element={element}
              onUpdate={handleElementUpdate}
              onDelete={handleElementDelete}
              onClick={handleElementClick}
              isSelected={isSelected(element.id)}
            />
          ))}

          {/* Resize Handles - Rendered separately to ensure proper positioning */}
          {elements.map(element => 
            isSelected(element.id) && (
              <ResizeHandles
                key={`handles-${element.id}`}
                element={element}
                onUpdate={handleElementUpdate}
                isVisible={true}
              />
            )
          )}
        </div>
      </div>

      {/* Floating Toolbar */}
      <CanvasToolbar
        selectedTool={selectedTool}
        selectedColor={selectedColor}
        brushThickness={brushThickness}
        onToolSelect={setSelectedTool}
        onColorSelect={setSelectedColor}
        onBrushThicknessChange={setBrushThickness}
        onAddElement={handleAddElement}
        isConnecting={isConnecting}
        onToggleConnecting={() => setIsConnecting(!isConnecting)}
        isTimerVisible={isTimerVisible}
        onToggleTimer={() => setIsTimerVisible(!isTimerVisible)}
        onToggleTextEditor={() => setIsTextEditorVisible(!isTextEditorVisible)}
        onToggleOptions={() => setIsOptionsMenuVisible(!isOptionsMenuVisible)}
        onToggleShapeLibrary={() => setIsShapeLibraryVisible(!isShapeLibraryVisible)}
        onExportPDF={() => handleExportPDF(false)}
        onExportSelectedArea={handleExportSelectedArea}
        hasSelection={selection.selectedIds.length > 0}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => {
          const prevElements = undo();
          if (prevElements) setElements(prevElements);
        }}
        onRedo={() => {
          const nextElements = redo();
          if (nextElements) setElements(nextElements);
        }}
      />

      {/* Timer */}
      <Timer
        isVisible={isTimerVisible}
        onToggle={() => setIsTimerVisible(!isTimerVisible)}
      />

      {/* Text Editor */}
      <TextEditor
        style={textStyle}
        onStyleChange={setTextStyle}
        isVisible={isTextEditorVisible && selectedTool === 'text'}
      />

      {/* Mini Map and Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-3">
        <MiniMap
          elements={elements}
          canvasTransform={canvasTransform}
          onNavigate={(x, y) => setCanvasTransform(prev => ({ ...prev, x, y }))}
        />
        
        {/* Zoom Controls */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-2 shadow-float">
          <div className="text-xs text-muted-foreground px-2 font-medium">
            {Math.round(canvasTransform.scale * 100)}%
          </div>
          <button 
            className="w-8 h-8 rounded-md bg-muted hover:bg-tool-hover flex items-center justify-center transition-colors"
            onClick={() => {
              const newScale = Math.min(3, canvasTransform.scale * 1.2);
              setCanvasTransform(prev => ({ ...prev, scale: newScale }));
            }}
            title="Zoom avant"
          >
            <span className="text-sm font-medium">+</span>
          </button>
          <button 
            className="w-8 h-8 rounded-md bg-muted hover:bg-tool-hover flex items-center justify-center transition-colors"
            onClick={() => {
              const newScale = Math.max(0.1, canvasTransform.scale * 0.8);
              setCanvasTransform(prev => ({ ...prev, scale: newScale }));
            }}
            title="Zoom arrière"
          >
            <span className="text-sm font-medium">−</span>
          </button>
          <button 
            className="w-8 h-8 rounded-md bg-muted hover:bg-tool-hover flex items-center justify-center transition-colors"
            onClick={() => {
              setCanvasTransform({ x: 0, y: 0, scale: 1 });
            }}
            title="Réinitialiser le zoom"
          >
            <span className="text-xs font-medium">1:1</span>
          </button>
        </div>
      </div>

      {/* Template Panel */}
      <TemplatePanel
        isVisible={isTemplatePanelVisible}
        onClose={() => setIsTemplatePanelVisible(false)}
        onApplyTemplate={handleApplyTemplate}
        currentElements={elements}
      />

      {/* Shape Library */}
      <ShapeLibrary
        isVisible={isShapeLibraryVisible}
        onClose={() => setIsShapeLibraryVisible(false)}
        onAddShape={handleAddElement}
      />

      {/* Comments List */}
      <CommentsList
        isVisible={isCommentsListVisible}
        onClose={() => setIsCommentsListVisible(false)}
        elements={elements}
      />

      {/* Export/Import Modal */}
      <ExportImportModal
        isVisible={isExportModalVisible}
        onClose={() => setIsExportModalVisible(false)}
        elements={elements}
        onImport={handleImportElements}
        canvasTransform={canvasTransform}
        onExportPDF={() => handleExportPDF(false)}
        onExportSelectedArea={handleExportSelectedArea}
        hasSelection={selection.selectedIds.length > 0}
      />

      {/* Options Menu */}
      <OptionsMenu
        isVisible={isOptionsMenuVisible}
        onToggle={() => setIsOptionsMenuVisible(!isOptionsMenuVisible)}
      />

      {/* Inline Editor */}
      {editingElement && (
        <InlineEditor
          element={editingElement.element}
          onUpdate={(updates) => {
            handleElementUpdate(editingElement.element.id, updates);
            setEditingElement(null);
          }}
          onClose={() => setEditingElement(null)}
          position={editingElement.position}
        />
      )}

    </div>
  );
};