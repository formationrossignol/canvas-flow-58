import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Search,
  AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  AlignHorizontalSpaceBetween, AlignVerticalSpaceBetween,
} from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from "sonner";
import { CanvasToolbar } from "./CanvasToolbar";
import { PropertyPanel } from "./PropertyPanel";
import { CanvasObject } from "./CanvasObject";
import { CanvasHeader } from "./CanvasHeader";
import { SelectionBox } from "./SelectionBox";
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
import { useCanvasStateManager } from "@/state/useCanvasStateManager";
import { screenToCanvas, generateId } from "@/utils/canvasHelpers";
import { templates } from "./templates";
import { useBoardPersistence, type StoredBoardSnapshot } from "@/hooks/useBoardPersistence";
import { useLocalCollaborator } from "@/hooks/useLocalCollaborator";
import { useBoardPresence } from "@/hooks/useBoardPresence";
import { CollaboratorCursors } from "./CollaboratorCursors";
import { CollaboratorsList } from "./CollaboratorsList";
import { ContextMenu } from "./ContextMenu";

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
  done?: boolean;
  createdAt?: number;
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
  
  // History management via CanvasStateManager
  const { addToHistory, undo, redo, canUndo, canRedo, resetHistory } = useCanvasStateManager<CanvasElement>();
  const [selectedColor, setSelectedColor] = useState('#FFE066');
  const [boardTitle, setBoardTitle] = useState('Tableau sans titre');
  const [isTemplatePanelVisible, setIsTemplatePanelVisible] = useState(false);
  const [isShapeLibraryVisible, setIsShapeLibraryVisible] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isCommentsListVisible, setIsCommentsListVisible] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [drawingStrokes, setDrawingStrokes] = useState<DrawingStroke[]>([]);
  const [brushThickness, setBrushThickness] = useState(3);
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [bgStyle, setBgStyle] = useState<'dots' | 'grid' | 'cross' | 'blank'>('dots');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isTextEditorVisible = selectedTool === 'text';
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

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    targetElement: CanvasElement | null;
    canvasX: number;
    canvasY: number;
  } | null>(null);

  const clipboardRef = useRef<CanvasElement | null>(null);
  
  const {
    canvasTransform,
    isSpacePressed,
    isDragging,
    handleMouseDown: canvasMouseDown,
    handleMouseMove: canvasMouseMove,
    handleMouseUp: canvasMouseUp,
    handleWheel,
    setCanvasTransform,
  } = useCanvasInteraction(containerRef, selectedTool === 'hand');

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

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    elements.forEach(el => el.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet);
  }, [elements]);

  const areAllSelectedLocked = useMemo(() => {
    if (selection.selectedIds.length === 0) {
      return false;
    }

    return selection.selectedIds.every((id) => {
      const element = elements.find((el) => el.id === id);
      return Boolean(element?.locked);
    });
  }, [selection.selectedIds, elements]);

  const searchMatchIds = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return new Set(elements.filter(el =>
      el.content?.toLowerCase().includes(q) ||
      el.author?.toLowerCase().includes(q) ||
      el.tags?.some(t => t.toLowerCase().includes(q))
    ).map(el => el.id));
  }, [elements, searchQuery]);

  // Alignment panel: position above selection in canvas coords (screen space)
  const alignPanelPosition = useMemo(() => {
    if (selection.selectedIds.length < 2) return null;
    const selEls = elements.filter(el => selection.selectedIds.includes(el.id));
    if (selEls.length < 2) return null;
    const bMinX = Math.min(...selEls.map(el => el.x));
    const bMaxX = Math.max(...selEls.map(el => el.x + el.width));
    const bMinY = Math.min(...selEls.map(el => el.y));
    const screenCx = canvasTransform.x + (bMinX + bMaxX) / 2 * canvasTransform.scale;
    const screenTopY = canvasTransform.y + bMinY * canvasTransform.scale;
    return { left: screenCx, top: Math.max(8, screenTopY - 44) };
  }, [selection.selectedIds, elements, canvasTransform]);

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
      id: generateId(type),
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
      createdAt: type === 'sticky' ? Date.now() : undefined,
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
      const { x, y } = screenToCanvas(e.clientX, e.clientY, rect, canvasTransform);

      // Keep pendingElement active so user can continue creating
      createElementAtPosition(pendingElement, x, y);
      return;
    }

    if (selectedTool === 'select' && !isSpacePressed) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const { x, y } = screenToCanvas(e.clientX, e.clientY, rect, canvasTransform);

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
      const { x, y } = screenToCanvas(e.clientX, e.clientY, rect, canvasTransform);
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

  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (pendingElement || isConnecting || selectedTool !== 'select') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const { x, y } = screenToCanvas(e.clientX, e.clientY, rect, canvasTransform);
    createElementAtPosition('sticky', x - 100, y - 100);
  }, [pendingElement, isConnecting, selectedTool, canvasTransform, createElementAtPosition]);

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

  const handleCanvasContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const { x: canvasX, y: canvasY } = screenToCanvas(e.clientX, e.clientY, rect, canvasTransform);
    setContextMenu({ x: e.clientX, y: e.clientY, targetElement: null, canvasX, canvasY });
  }, [canvasTransform]);

  const handleElementContextMenu = useCallback((e: React.MouseEvent, element: CanvasElement) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, targetElement: element, canvasX: 0, canvasY: 0 });
  }, []);

  const handleCopy = useCallback(() => {
    if (!contextMenu?.targetElement) return;
    clipboardRef.current = { ...contextMenu.targetElement };
  }, [contextMenu]);

  const handleCut = useCallback(() => {
    if (!contextMenu?.targetElement) return;
    clipboardRef.current = { ...contextMenu.targetElement };
    handleElementDelete(contextMenu.targetElement.id);
  }, [contextMenu, handleElementDelete]);

  const handlePaste = useCallback(() => {
    const el = clipboardRef.current;
    if (!el) return;
    const pasted: CanvasElement = {
      ...el,
      id: `${el.type}-${Date.now()}`,
      x: el.x + 20,
      y: el.y + 20,
    };
    setElements(prev => {
      const next = [...prev, pasted];
      addToHistory(next);
      return next;
    });
  }, [addToHistory]);

  const handleBringToFront = useCallback(() => {
    if (!contextMenu?.targetElement) return;
    const maxZ = elements.length > 0 ? Math.max(...elements.map(el => el.zIndex ?? 0)) : 0;
    handleElementUpdate(contextMenu.targetElement.id, { zIndex: maxZ + 1 });
  }, [contextMenu, elements, handleElementUpdate]);

  const handleSendToBack = useCallback(() => {
    if (!contextMenu?.targetElement) return;
    const minZ = elements.length > 0 ? Math.min(...elements.map(el => el.zIndex ?? 0)) : 0;
    handleElementUpdate(contextMenu.targetElement.id, { zIndex: minZ - 1 });
  }, [contextMenu, elements, handleElementUpdate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Tool shortcuts (single-key, no modifier)
      if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'v': setSelectedTool('select'); return;
          case 'p': setSelectedTool('pen'); return;
          case 'h': setSelectedTool('hand'); return;
          case 'e': setSelectedTool('eraser'); return;
          case 's': setSelectedTool('sticky'); handleAddElement('sticky'); return;
          case 't': setSelectedTool('text'); handleAddElement('text'); return;
          case 'f': setSelectedTool('shapes'); setIsShapeLibraryVisible(true); return;
          case 'i': setSelectedTool('image'); handleAddElement('image'); return;
          case 'c': setSelectedTool('comment'); handleAddElement('comment'); return;
          case 'l': setSelectedTool('connect'); setIsConnecting(prev => !prev); return;
        }
      }

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
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setShowSearch(prev => !prev);
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
  }, [selection.selectedIds, handleElementDelete, handleElementDuplicate, clearSelection, undo, redo, addToHistory, setCanvasTransform, handleFitToScreen, handleAddElement]);

  const cursor = pendingElement
    ? 'crosshair'
    : isSpacePressed && isDragging
    ? 'canvas-cursor-grabbing'
    : isSpacePressed
    ? 'canvas-cursor-grab'
    : selectedTool === 'pen' || selectedTool === 'eraser'
    ? 'crosshair'
    : 'default';

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

  const handleInsertEmoji = useCallback((emoji: string) => {
    const cx = (-canvasTransform.x + window.innerWidth / 2) / canvasTransform.scale;
    const cy = (-canvasTransform.y + window.innerHeight / 2) / canvasTransform.scale;
    const newEl: CanvasElement = {
      id: `text-${Date.now()}`, type: 'text',
      x: cx - 32, y: cy - 32, width: 64, height: 64,
      color: selectedColor, content: emoji, fontSize: 40,
    };
    setElements(prev => { const n = [...prev, newEl]; addToHistory(n); return n; });
  }, [canvasTransform, selectedColor, addToHistory]);

  const handleAlign = useCallback((dir: 'left' | 'centerH' | 'right' | 'top' | 'centerV' | 'bottom') => {
    if (selection.selectedIds.length < 2) return;
    const selected = elements.filter(el => selection.selectedIds.includes(el.id));
    const updates: Record<string, Partial<CanvasElement>> = {};
    if (dir === 'left') {
      const minX = Math.min(...selected.map(el => el.x));
      selected.forEach(el => { updates[el.id] = { x: minX }; });
    } else if (dir === 'centerH') {
      const minX = Math.min(...selected.map(el => el.x));
      const maxX = Math.max(...selected.map(el => el.x + el.width));
      const cx = (minX + maxX) / 2;
      selected.forEach(el => { updates[el.id] = { x: cx - el.width / 2 }; });
    } else if (dir === 'right') {
      const maxX = Math.max(...selected.map(el => el.x + el.width));
      selected.forEach(el => { updates[el.id] = { x: maxX - el.width }; });
    } else if (dir === 'top') {
      const minY = Math.min(...selected.map(el => el.y));
      selected.forEach(el => { updates[el.id] = { y: minY }; });
    } else if (dir === 'centerV') {
      const minY = Math.min(...selected.map(el => el.y));
      const maxY = Math.max(...selected.map(el => el.y + el.height));
      const cy = (minY + maxY) / 2;
      selected.forEach(el => { updates[el.id] = { y: cy - el.height / 2 }; });
    } else if (dir === 'bottom') {
      const maxY = Math.max(...selected.map(el => el.y + el.height));
      selected.forEach(el => { updates[el.id] = { y: maxY - el.height }; });
    }
    setElements(prev => {
      const next = prev.map(el => updates[el.id] ? { ...el, ...updates[el.id] } : el);
      addToHistory(next);
      return next;
    });
  }, [selection.selectedIds, elements, addToHistory]);

  const handleDistribute = useCallback((axis: 'h' | 'v') => {
    if (selection.selectedIds.length < 3) return;
    const selected = elements.filter(el => selection.selectedIds.includes(el.id));
    const updates: Record<string, Partial<CanvasElement>> = {};
    if (axis === 'h') {
      const sorted = [...selected].sort((a, b) => a.x - b.x);
      const minX = sorted[0].x;
      const maxX = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width;
      const totalW = sorted.reduce((s, el) => s + el.width, 0);
      const gap = (maxX - minX - totalW) / (sorted.length - 1);
      let cx = minX;
      sorted.forEach(el => { updates[el.id] = { x: cx }; cx += el.width + gap; });
    } else {
      const sorted = [...selected].sort((a, b) => a.y - b.y);
      const minY = sorted[0].y;
      const maxY = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height;
      const totalH = sorted.reduce((s, el) => s + el.height, 0);
      const gap = (maxY - minY - totalH) / (sorted.length - 1);
      let cy = minY;
      sorted.forEach(el => { updates[el.id] = { y: cy }; cy += el.height + gap; });
    }
    setElements(prev => {
      const next = prev.map(el => updates[el.id] ? { ...el, ...updates[el.id] } : el);
      addToHistory(next);
      return next;
    });
  }, [selection.selectedIds, elements, addToHistory]);

  const bgPatterns: Record<string, React.CSSProperties> = {
    grid: {
      backgroundImage: 'linear-gradient(rgba(107,114,128,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(107,114,128,0.15) 1px,transparent 1px)',
      backgroundSize: `${32 / canvasTransform.scale}px ${32 / canvasTransform.scale}px`,
      backgroundPosition: `${canvasTransform.x}px ${canvasTransform.y}px`,
    },
    dots: {
      backgroundImage: 'radial-gradient(circle,rgba(107,114,128,0.25) 1.5px,transparent 1.5px)',
      backgroundSize: `${24 / canvasTransform.scale}px ${24 / canvasTransform.scale}px`,
      backgroundPosition: `${canvasTransform.x}px ${canvasTransform.y}px`,
    },
    cross: {
      backgroundImage: 'linear-gradient(rgba(107,114,128,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(107,114,128,0.1) 1px,transparent 1px)',
      backgroundSize: `${48 / canvasTransform.scale}px ${48 / canvasTransform.scale}px`,
      backgroundPosition: `${canvasTransform.x}px ${canvasTransform.y}px`,
    },
    blank: {},
  };

  const bgLabels: Record<string, string> = { grid: '⊞', dots: '⠿', cross: '✚', blank: '□' };
  const bgOrder: Array<'grid' | 'dots' | 'cross' | 'blank'> = ['grid', 'dots', 'cross', 'blank'];

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
        elementCount={elements.length}
      />

      {/* Tag Filter Bar — inline 36px strip below header */}
      {allTags.length > 0 && (() => {
        const tagPalette = [
          { bg: '#D1FAE5', text: '#059669', activeBg: '#059669' },
          { bg: '#FEE2E2', text: '#DC2626', activeBg: '#DC2626' },
          { bg: '#FEF9C3', text: '#D97706', activeBg: '#D97706' },
          { bg: '#DBEAFE', text: '#2563EB', activeBg: '#2563EB' },
          { bg: '#EDE9FE', text: '#7C3AED', activeBg: '#7C3AED' },
          { bg: '#FCE7F3', text: '#DB2777', activeBg: '#DB2777' },
        ];
        return (
          <div style={{
            position: 'fixed', top: 52, left: 0, right: 0, height: 36, zIndex: 10,
            background: 'white', borderBottom: '1px solid rgba(15,23,42,0.06)',
            display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', overflowX: 'auto',
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>Tags</span>
            {allTags.map((tag, i) => {
              const pal = tagPalette[i % tagPalette.length];
              const active = activeTagFilter === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTagFilter(active ? null : tag)}
                  style={{
                    height: 22, padding: '0 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
                    fontFamily: 'inherit', transition: 'all 0.12s',
                    background: active ? pal.activeBg : pal.bg,
                    color: active ? 'white' : pal.text,
                  }}
                >
                  {tag}
                </button>
              );
            })}
            {activeTagFilter && (
              <button
                onClick={() => setActiveTagFilter(null)}
                style={{
                  height: 22, padding: '0 9px', borderRadius: 20,
                  border: '1px solid rgba(15,23,42,0.12)', background: 'transparent',
                  color: '#9CA3AF', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 4,
                }}
              >× Tout afficher</button>
            )}
          </div>
        );
      })()}

      {/* Pending element hint banner */}
      {pendingElement && (
        <div style={{
          position: 'fixed', top: allTags.length > 0 ? 92 : 56, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(15,23,42,0.72)', color: 'white',
          fontSize: 12, fontWeight: 500, padding: '6px 16px',
          borderRadius: 20, pointerEvents: 'none', zIndex: 25,
          backdropFilter: 'blur(8px)', whiteSpace: 'nowrap', letterSpacing: -0.1,
        }}>
          Cliquez pour placer · Échap pour annuler
        </div>
      )}

      {/* Connecting mode banner */}
      {isConnecting && !pendingElement && (
        <div style={{
          position: 'fixed', top: allTags.length > 0 ? 92 : 56, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(99,102,241,0.88)', color: 'white',
          fontSize: 12, fontWeight: 500, padding: '6px 16px',
          borderRadius: 20, pointerEvents: 'none', zIndex: 25,
          backdropFilter: 'blur(8px)', whiteSpace: 'nowrap',
        }}>
          🔗 Mode connexion — Cliquez sur un élément cible
        </div>
      )}

      {/* Search bar */}
      {showSearch && (
        <div style={{
          position: 'fixed', top: allTags.length > 0 ? 92 : 56, right: 16, zIndex: 50,
          background: 'white', border: '1px solid rgba(15,23,42,0.08)',
          borderRadius: 12, padding: '6px 12px',
          boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Search size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} />
          <input
            autoFocus
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') { setShowSearch(false); setSearchQuery(''); } }}
            placeholder="Rechercher..."
            style={{ border: 'none', outline: 'none', fontSize: 13, width: 180, background: 'transparent' }}
          />
          {searchQuery && (
            <span style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
              {searchMatchIds?.size ?? 0} résultat{(searchMatchIds?.size ?? 0) !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={() => { setShowSearch(false); setSearchQuery(''); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 14, padding: 2, display: 'flex', alignItems: 'center' }}
          >✕</button>
        </div>
      )}

      {/* (Alignment panel is rendered inside canvas container — see below) */}

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className={`absolute inset-0 overflow-hidden ${cursor}`}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseLeave}
        onWheel={handleWheel}
        onContextMenu={handleCanvasContextMenu}
        onDoubleClick={handleCanvasDoubleClick}
        style={{
          paddingTop: allTags.length > 0 ? 84 : 48,
          cursor: cursor === 'canvas-cursor-grab' ? 'grab' : cursor === 'canvas-cursor-grabbing' ? 'grabbing' : cursor,
        }}
      >
        <CollaboratorCursors cursors={remoteCursors} />
        <CollaboratorsList
          participants={remoteParticipants}
          currentUserName={localCollaborator.name}
        />

        {/* Alignment panel — absolute, floats above selection */}
        {alignPanelPosition && (
          <div style={{
            position: 'absolute',
            left: alignPanelPosition.left,
            top: alignPanelPosition.top,
            transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: 1,
            background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(15,23,42,0.07)',
            borderRadius: 10, padding: '3px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            zIndex: 50, whiteSpace: 'nowrap', pointerEvents: 'auto',
          }}>
            {([
              { dir: 'left' as const, Icon: AlignStartHorizontal, title: 'Aligner à gauche' },
              { dir: 'centerH' as const, Icon: AlignCenterHorizontal, title: 'Centrer horizontalement' },
              { dir: 'right' as const, Icon: AlignEndHorizontal, title: 'Aligner à droite' },
            ]).map(({ dir, Icon, title }) => (
              <button key={dir} onClick={() => handleAlign(dir)} title={title}
                style={{ width: 28, height: 28, borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
                <Icon size={13} />
              </button>
            ))}
            <div style={{ width: 1, height: 16, background: 'rgba(15,23,42,0.1)', margin: '0 2px' }} />
            {([
              { dir: 'top' as const, Icon: AlignStartVertical, title: 'Aligner en haut' },
              { dir: 'centerV' as const, Icon: AlignCenterVertical, title: 'Centrer verticalement' },
              { dir: 'bottom' as const, Icon: AlignEndVertical, title: 'Aligner en bas' },
            ]).map(({ dir, Icon, title }) => (
              <button key={dir} onClick={() => handleAlign(dir)} title={title}
                style={{ width: 28, height: 28, borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
                <Icon size={13} />
              </button>
            ))}
            <div style={{ width: 1, height: 16, background: 'rgba(15,23,42,0.1)', margin: '0 2px' }} />
            <button onClick={() => handleDistribute('h')} title="Espacer horizontalement"
              style={{ width: 28, height: 28, borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
              <AlignHorizontalSpaceBetween size={13} />
            </button>
            <button onClick={() => handleDistribute('v')} title="Espacer verticalement"
              style={{ width: 28, height: 28, borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
              <AlignVerticalSpaceBetween size={13} />
            </button>
            <div style={{ width: 1, height: 16, background: 'rgba(15,23,42,0.1)', margin: '0 2px' }} />
            <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500, padding: '0 6px', whiteSpace: 'nowrap' }}>
              {selection.selectedIds.length} élément{selection.selectedIds.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
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
          {/* Background pattern */}
          <div
            className="absolute"
            style={{
              left: '-20000px', top: '-20000px', width: '60000px', height: '60000px',
              ...bgPatterns[bgStyle],
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
              element={
                searchMatchIds !== null && !searchMatchIds.has(element.id)
                  ? { ...element, opacity: Math.min(element.opacity ?? 1, 0.12) }
                  : activeTagFilter !== null && element.type === 'sticky' && !element.tags?.includes(activeTagFilter)
                  ? { ...element, opacity: Math.min(element.opacity ?? 1, 0.15) }
                  : element
              }
              onUpdate={handleElementUpdate}
              onUpdateSilent={handleElementUpdateSilent}
              onDelete={handleElementDelete}
              onClick={handleElementClick}
              isSelected={isSelected(element.id)}
              selectedIds={selection.selectedIds}
              canvasScale={canvasTransform.scale}
              onMoveSelected={handleMoveSelected}
              onDragEnd={handleDragEnd}
              onContextMenu={handleElementContextMenu}
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

      {/* Background Style Toggle */}
      <button
        onClick={() => setBgStyle(prev => bgOrder[(bgOrder.indexOf(prev) + 1) % bgOrder.length])}
        className="fixed bottom-24 left-4 z-10 w-8 h-8 rounded-lg bg-card/80 backdrop-blur-sm border border-border shadow-soft text-sm hover:bg-card transition-colors"
        title="Changer le fond"
      >
        {bgLabels[bgStyle]}
      </button>

      {/* Bottom Toolbar */}
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
        onToggleTextEditor={() => {}}
        onToggleOptions={() => setIsExportModalVisible(true)}
        onToggleShapeLibrary={() => setIsShapeLibraryVisible(!isShapeLibraryVisible)}
        onExportPDF={() => handleExportPDF(false)}
        onExportSelectedArea={handleExportSelectedArea}
        hasSelection={selection.selectedIds.length > 0}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => { const prev = undo(); if (prev) setElements(prev); }}
        onRedo={() => { const next = redo(); if (next) setElements(next); }}
        onInsertEmoji={handleInsertEmoji}
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
        isVisible={isTextEditorVisible}
      />

      {/* Mini Map with Zoom Controls */}
      <MiniMap
        elements={elements}
        canvasTransform={canvasTransform}
        onNavigate={(x, y) => setCanvasTransform(prev => ({ ...prev, x, y }))}
        onZoomChange={(scale) => setCanvasTransform(prev => ({ ...prev, scale }))}
        onFitToScreen={handleFitToScreen}
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

      {/* Property Panel */}
      <PropertyPanel
        selectedElements={elements.filter(el => selection.selectedIds.includes(el.id))}
        isVisible={selection.selectedIds.length > 0}
        onClose={clearSelection}
        onUpdate={handleElementUpdate}
        onDelete={handleElementDelete}
        onDuplicate={handleElementDuplicate}
      />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          targetElement={contextMenu.targetElement}
          isLocked={contextMenu.targetElement?.locked}
          canvasX={contextMenu.canvasX}
          canvasY={contextMenu.canvasY}
          onClose={() => setContextMenu(null)}
          onPaste={handlePaste}
          onFitToScreen={handleFitToScreen}
          onAddSticky={(x, y) => createElementAtPosition('sticky', x, y)}
          onAddText={(x, y) => createElementAtPosition('text', x, y)}
          onAddShape={() => setIsShapeLibraryVisible(true)}
          onCopy={handleCopy}
          onCut={handleCut}
          onDuplicate={() => contextMenu.targetElement && handleElementDuplicate(contextMenu.targetElement.id)}
          onDelete={() => contextMenu.targetElement && handleElementDelete(contextMenu.targetElement.id)}
          onToggleLock={() => contextMenu.targetElement && handleElementUpdate(contextMenu.targetElement.id, { locked: !contextMenu.targetElement.locked })}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
        />
      )}

    </div>
  );
};