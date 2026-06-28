import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from "sonner";
import { ToolbarLeft } from "./ToolbarLeft";
import { BottomBar } from "./BottomBar";
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
import { useBoardPersistence, type StoredBoardSnapshot } from "@/hooks/useBoardPersistence";
import { useLocalCollaborator } from "@/hooks/useLocalCollaborator";
import { useBoardPresence } from "@/hooks/useBoardPresence";
import { CollaboratorCursors } from "./CollaboratorCursors";
import { CollaboratorsList } from "./CollaboratorsList";
import { ContextualBar } from "./ContextualBar";

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
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  borderRadius?: number;
  opacity?: number;
  rotation?: number;
  locked?: boolean;
  zIndex?: number;
  imageUrl?: string;
  textStyle?: React.CSSProperties;
  likedBy?: string[];
  comments?: Comment[];
  tags?: string[];
  author?: string;
}

interface CanvasProps {
  boardId?: string;
  templateId?: string | null;
}

export const Canvas = ({ boardId, templateId }: CanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const elementsRef = useRef<CanvasElement[]>([]);
  elementsRef.current = elements;
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [pendingElement, setPendingElement] = useState<CanvasElement['type'] | null>(null);
  
  // History management
  const { addToHistory, undo, redo, canUndo, canRedo, resetHistory } = useHistory(elements);
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
  const [textStyle, setTextStyle] = useState<{
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    textAlign?: 'left' | 'center' | 'right';
    color?: string;
  }>({});
  const pendingImageUrlRef = useRef<string | null>(null);
  const lastCursorUpdateRef = useRef(0);
  
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

  const localCollaborator = useLocalCollaborator();
  const { remoteParticipants, remoteCursors, updateCursor: updatePresenceCursor, hideCursor } = useBoardPresence({
    boardId: boardId ?? 'local',
    currentUser: localCollaborator,
    containerRef,
  });

  const collaborators = useMemo(
    () => [localCollaborator, ...remoteParticipants].map(participant => ({
      id: participant.id,
      name: participant.name,
      color: participant.color,
      avatar: participant.avatar ?? '',
    })),
    [localCollaborator, remoteParticipants]
  );

  const restoreBoardFromSnapshot = useCallback((snapshot: StoredBoardSnapshot) => {
    const nextElements = snapshot.elements ?? [];
    setElements(nextElements);
    setConnections(snapshot.connections ?? []);
    setDrawingStrokes(snapshot.drawingStrokes ?? []);
    setBoardTitle(snapshot.boardTitle || 'Tableau sans titre');
    clearSelection();
    resetHistory(nextElements);
  }, [clearSelection, resetHistory]);

  const { lastSavedAt, isSaving, hasSnapshot, saveNow, resetBoard: resetBoardStorage } = useBoardPersistence({
    boardId,
    elements,
    connections,
    drawingStrokes,
    boardTitle,
    onLoad: restoreBoardFromSnapshot,
  });

  const totalComments = useMemo(
    () => elements.reduce((acc, element) => acc + (element.comments?.length ?? 0), 0),
    [elements]
  );

  const areAllSelectedLocked = useMemo(() => {
    if (selection.selectedIds.length === 0) {
      return false;
    }

    return selection.selectedIds.every((id) => {
      const element = elements.find((el) => el.id === id);
      return Boolean(element?.locked);
    });
  }, [selection.selectedIds, elements]);

  const templateAppliedRef = useRef(false);

  const handleForceSave = useCallback(() => {
    saveNow();
    toast.success("Tableau sauvegardé localement");
  }, [saveNow]);

  const handleResetBoard = useCallback(() => {
    const confirmed = window.confirm("Voulez-vous réinitialiser ce tableau ? Cette action supprimera les éléments locaux.");
    if (!confirmed) return;

    setElements([]);
    setConnections([]);
    setDrawingStrokes([]);
    clearSelection();
    setBoardTitle('Tableau sans titre');
    resetHistory([]);
    resetBoardStorage();
    templateAppliedRef.current = false;
    toast.success("Tableau réinitialisé");
  }, [clearSelection, resetBoardStorage, resetHistory]);

  useEffect(() => {
    setElements([]);
    setConnections([]);
    setDrawingStrokes([]);
    clearSelection();
    setBoardTitle('Tableau sans titre');
    resetHistory([]);
    templateAppliedRef.current = false;
    setPendingElement(null);
    setSelectedTool('select');
  }, [boardId, clearSelection, resetHistory]);

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
            pendingImageUrlRef.current = imageUrl;
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
      fontFamily: (type === 'text' || type === 'sticky') ? textStyle.fontFamily : undefined,
      textAlign: (type === 'text' || type === 'sticky') ? textStyle.textAlign : undefined,
      textStyle: type === 'text' ? {
        fontWeight: textStyle.fontWeight,
        fontStyle: textStyle.fontStyle,
        textDecoration: textStyle.textDecoration,
        color: textStyle.color,
      } : undefined,
      borderRadius: type === 'rectangle' ? 8 : type === 'comment' ? 12 : 0,
      imageUrl: type === 'image' ? (pendingImageUrlRef.current ?? undefined) : undefined,
      comments: type === 'comment' ? [] : undefined,
      author: type === 'sticky' ? localCollaborator.name : undefined,
    };

    if (type === 'image') {
      pendingImageUrlRef.current = null;
    }

    setElements(prev => {
      const newElements = [...prev, newElement];
      addToHistory(newElements);
      return newElements;
    });
  }, [selectedColor, textStyle, addToHistory, localCollaborator]);

  const handleElementUpdate = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements(prev => {
      const newElements = prev.map(el => el.id === id ? { ...el, ...updates } : el);
      addToHistory(newElements);
      return newElements;
    });
  }, [addToHistory]);

  // Silent update — no history entry (used during drag/resize)
  const handleElementUpdateSilent = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  }, []);

  // Move all selected elements by canvas-space delta (called every mousemove during drag)
  const handleMoveSelected = useCallback((dx: number, dy: number) => {
    setElements(prev => prev.map(el =>
      selection.selectedIds.includes(el.id) && !el.locked
        ? { ...el, x: el.x + dx, y: el.y + dy }
        : el
    ));
  }, [selection.selectedIds]);

  // Commit drag to history once mouse released
  const handleDragEnd = useCallback(() => {
    addToHistory(elementsRef.current);
  }, [addToHistory]);

  // Commit resize to history once mouse released
  const handleResizeEnd = useCallback(() => {
    addToHistory(elementsRef.current);
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
    if (element.locked) {
      toast.error("Impossible de dupliquer un élément verrouillé");
      return;
    }

    const newElement: CanvasElement = {
      ...element,
      id: `${element.type}-${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20,
      likedBy: [], // Reset likes for duplicated element
      locked: false,
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
      if (element && !element.locked) {
        const newElement: CanvasElement = {
          ...element,
          id: `${element.type}-${Date.now()}-${Math.random()}`,
          x: element.x + 20,
          y: element.y + 20,
          likedBy: [], // Reset likes for duplicated element
          locked: false,
        };
        newElements.push(newElement);
      }
    });

    if (newElements.length === 0) {
      toast.error("Impossible de dupliquer des éléments verrouillés");
      return;
    }

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
    setConnections([]);
    setDrawingStrokes([]);
    addToHistory(templateElements);
    clearSelection();
    toast.success("Template appliqué au tableau");
  }, [clearSelection, addToHistory]);

  const handleImportElements = useCallback((importedElements: CanvasElement[]) => {
    setElements(importedElements);
    setConnections([]);
    setDrawingStrokes([]);
    addToHistory(importedElements);
    clearSelection();
    toast.success("Données importées avec succès");
  }, [clearSelection, addToHistory]);

  // Enhanced selection and interaction handlers
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // If we have a pending element, create it at click position and keep it pending
    if (pendingElement && !isSpacePressed) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale;
      const y = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale;

      // Keep pendingElement active so user can continue creating
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
    const now = Date.now();
    if (now - lastCursorUpdateRef.current > 32) {
      updatePresenceCursor(e.clientX, e.clientY);
      lastCursorUpdateRef.current = now;
    }

    if (selection.selectionBox.isActive) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale;
      const y = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale;

      updateSelectionBox(x, y);
    } else {
      canvasMouseMove(e);
    }
  }, [updatePresenceCursor, selection.selectionBox.isActive, canvasTransform, updateSelectionBox, canvasMouseMove]);

  const handleCanvasMouseLeave = useCallback(() => {
    hideCursor();
  }, [hideCursor]);

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

  // Load template if templateId is provided and no snapshot exists yet
  useEffect(() => {
    if (!templateId || templateAppliedRef.current) return;
    if (hasSnapshot) return;
    if (elements.length > 0) return;

    const template = templates.find(t => t.id === templateId);
    if (!template || template.elements.length === 0) return;

    const baseTime = Date.now();
    const templateElements = template.elements.map((element, index) => ({
      ...element,
      id: `${element.type}-${baseTime}-${index}`,
      comments: element.comments ? element.comments.map(comment => ({ ...comment })) : element.type === 'comment' ? [] : element.comments,
      likedBy: element.likedBy ? [...element.likedBy] : [],
    }));

    setElements(templateElements);
    setConnections([]);
    setDrawingStrokes([]);
    setBoardTitle(template.name);
    clearSelection();
    resetHistory(templateElements);
    templateAppliedRef.current = true;
    toast.success(`Template "${template.name}" appliqué`);
  }, [templateId, hasSnapshot, elements.length, clearSelection, resetHistory]);

  const handleFitToScreen = useCallback(() => {
    if (!elements.length) {
      setCanvasTransform({ x: 0, y: 0, scale: 1 });
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const minX = Math.min(...elements.map(el => el.x));
    const minY = Math.min(...elements.map(el => el.y));
    const maxX = Math.max(...elements.map(el => el.x + el.width));
    const maxY = Math.max(...elements.map(el => el.y + el.height));
    const contentW = maxX - minX;
    const contentH = maxY - minY;
    const scale = Math.min(
      (rect.width - 128) / contentW,
      (rect.height - 128) / contentH,
      1
    );
    const x = (rect.width - contentW * scale) / 2 - minX * scale;
    const y = (rect.height - contentH * scale) / 2 - minY * scale;
    setCanvasTransform({ x, y, scale });
  }, [elements, setCanvasTransform]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        selection.selectedIds.forEach(id => handleElementDelete(id));
        clearSelection();
      } else if (e.key === 'Escape') {
        clearSelection();
        setPendingElement(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        selection.selectedIds.forEach(id => handleElementDuplicate(id));
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const prevElements = undo();
        if (prevElements) setElements(prevElements);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        const nextElements = redo();
        if (nextElements) setElements(nextElements);
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        handleFitToScreen();
      } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        if (selection.selectedIds.length > 0) {
          e.preventDefault();
          const step = e.shiftKey ? 8 : 1;
          const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
          const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
          setElements(prev => {
            const newElements = prev.map(el =>
              selection.selectedIds.includes(el.id) && !el.locked
                ? { ...el, x: el.x + dx, y: el.y + dy }
                : el
            );
            addToHistory(newElements);
            return newElements;
          });
        } else {
          // Pan canvas when nothing selected
          const step = e.shiftKey ? 50 : 10;
          const dx = e.key === 'ArrowLeft' ? step : e.key === 'ArrowRight' ? -step : 0;
          const dy = e.key === 'ArrowUp' ? step : e.key === 'ArrowDown' ? -step : 0;
          setCanvasTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection.selectedIds, handleElementDelete, handleElementDuplicate, clearSelection, undo, redo, addToHistory, setCanvasTransform, handleFitToScreen]);

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
    <div className="relative w-full h-screen overflow-hidden bg-canvas">
      {/* Header */}
      <CanvasHeader
        boardTitle={boardTitle}
        onTitleChange={setBoardTitle}
        collaborators={collaborators}
        onOpenTemplates={() => setIsTemplatePanelVisible(true)}
        onOpenExport={() => setIsExportModalVisible(true)}
        onOpenComments={() => setIsCommentsListVisible(true)}
        selectedCount={selection.selectedIds.length}
        onDuplicateSelected={
          selection.selectedIds.length > 0
            ? () => selection.selectedIds.forEach(id => handleElementDuplicate(id))
            : undefined
        }
        boardId={boardId}
        lastSavedAt={lastSavedAt}
        isSaving={isSaving}
        onSaveNow={handleForceSave}
        onResetBoard={handleResetBoard}
        onToggleTimer={() => setIsTimerVisible(!isTimerVisible)}
      />

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className={`absolute inset-0 pt-16 overflow-hidden ${cursor}`}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseLeave}
        onWheel={handleWheel}
        style={{ cursor: cursor === 'canvas-cursor-grab' ? 'grab' : cursor === 'canvas-cursor-grabbing' ? 'grabbing' : cursor }}
      >
        <CollaboratorCursors cursors={remoteCursors} />
        <CollaboratorsList 
          participants={remoteParticipants} 
          currentUserName={localCollaborator.name}
        />
        {/* Canvas Content */}
        <div
          className="absolute bg-canvas"
          style={{
            transform: `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
            minWidth: '200vw',
            minHeight: '200vh',
          }}
        >
          {/* Grid Background with primary color - fixed scale */}
          <div 
            className="absolute"
            style={{
              left: '-20000px',
              top: '-20000px',
              width: '60000px',
              height: '60000px',
              backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
              backgroundSize: `${32 / canvasTransform.scale}px ${32 / canvasTransform.scale}px`,
              backgroundPosition: `${canvasTransform.x}px ${canvasTransform.y}px`,
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
              onUpdateSilent={handleElementUpdateSilent}
              onDelete={handleElementDelete}
              onClick={handleElementClick}
              isSelected={isSelected(element.id)}
              selectedIds={selection.selectedIds}
              canvasScale={canvasTransform.scale}
              onMoveSelected={handleMoveSelected}
              onDragEnd={handleDragEnd}
            />
          ))}

          {/* Resize Handles - Rendered separately to ensure proper positioning */}
          {elements.map(element =>
            isSelected(element.id) && (
              <ResizeHandles
                key={`handles-${element.id}`}
                element={element}
                onUpdateSilent={handleElementUpdateSilent}
                onResizeEnd={handleResizeEnd}
                isVisible={true}
                canvasScale={canvasTransform.scale}
              />
            )
          )}
        </div>
      </div>

      {/* Left Toolbar */}
      <ToolbarLeft
        selectedTool={selectedTool}
        isConnecting={isConnecting}
        onToolSelect={setSelectedTool}
        onAddElement={handleAddElement}
        onToggleConnecting={() => setIsConnecting(!isConnecting)}
        onToggleShapeLibrary={() => setIsShapeLibraryVisible(!isShapeLibraryVisible)}
      />

      {/* Bottom Bar */}
      <BottomBar
        canUndo={canUndo}
        canRedo={canRedo}
        scale={canvasTransform.scale}
        onUndo={() => { const prev = undo(); if (prev) setElements(prev); }}
        onRedo={() => { const next = redo(); if (next) setElements(next); }}
        onZoomChange={(scale) => setCanvasTransform(prev => ({ ...prev, scale }))}
        onFitToScreen={handleFitToScreen}
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

      {/* Mini Map with Zoom Controls */}
      <MiniMap
        elements={elements}
        canvasTransform={canvasTransform}
        onNavigate={(x, y) => setCanvasTransform(prev => ({ ...prev, x, y }))}
        onZoomChange={(scale) => setCanvasTransform(prev => ({ ...prev, scale }))}
      />

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

      {/* Contextual Bar */}
      <ContextualBar
        selectedElements={elements.filter(el => selection.selectedIds.includes(el.id))}
        canvasTransform={canvasTransform}
        onUpdate={handleElementUpdate}
        onDelete={handleElementDelete}
        onDuplicate={handleElementDuplicate}
      />

    </div>
  );
};