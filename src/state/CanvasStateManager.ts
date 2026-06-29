/**
 * FLOWBOARD v2 — Canvas State Manager
 * Gestion centralisée de l'état du canvas
 */

export interface CanvasElement {
  id: string;
  type: 'sticky' | 'text' | 'rect' | 'circle' | 'image' | 'path' | 'connector' | 'comment';
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  borderColor?: string;
  borderRadius?: number;
  content?: string;
  fontSize?: number;
  fontWeight?: number;
  textColor?: string;
  locked?: boolean;
  zIndex?: number;
  rotation?: number;
  opacity?: number;
  
  // Sticky specific
  author?: string;
  authorColor?: string;
  tag?: string;
  tagColor?: string;
  likes?: number;
  done?: boolean;
  
  // Path specific
  points?: [number, number][];
  strokeColor?: string;
  strokeWidth?: number;
  
  // Connector specific
  fromId?: string;
  toId?: string;
  label?: string;
  dashed?: boolean;
  
  // Image specific
  src?: string;
  
  // Internal
  isNew?: boolean;
  createdAt?: number;
}

export interface CanvasState {
  elements: CanvasElement[];
  selectedIds: string[];
  transform: { x: number; y: number; scale: number };
  boardTitle: string;
  bgStyle: 'dots' | 'grid' | 'cross' | 'blank';
  tool: 'select' | 'hand' | 'sticky' | 'text' | 'rect' | 'circle' | 'pen' | 'eraser' | 'comment' | 'connect';
  
  // Colors
  color: string;
  penColor: string;
  penWidth: number;
  
  // History
  history: CanvasElement[][];
  historyIndex: number;
  
  // UI
  showColors: boolean;
  editingId: string | null;
  editContent: string;
  propElId: string | null;
  showPropPanel: boolean;
  showSettings: boolean;
  showSearch: boolean;
  showTemplates: boolean;
  showTimer: boolean;
  presentMode: boolean;
  
  // Interactions
  selectionBox: { sx: number; sy: number; ex: number; ey: number } | null;
  dragOver: boolean;
  contextMenu: { elId: string; canvasX: number; canvasY: number; x: number; y: number } | null;
  
  // Connectors
  connectorStart: { id: string; cx: number; cy: number } | null;
  connectorPreview: { x: number; y: number } | null;
  editingConnectorId: string | null;
  connectorEditContent: string;
  
  // Drawing
  currentPath: { points: [number, number][]; color: string; width: number } | null;
  
  // Search
  searchQuery: string;
  searchMatchIds: string[];
  activeTagFilter: string | null;
  
  // Timer
  timerSeconds: number;
  timerRunning: boolean;
  timerElapsed: number;
  
  // Collaborators
  collaboratorCursors: Array<{ id: string; name: string; color: string; x: number; y: number }>;
  
  // Activity
  toasts: Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }>;
  activities: Array<{ id: number; color: string; initial: string; name: string; text: string; ts: number }>;
}

export type CanvasAction = 
  | { type: 'ADD_ELEMENT'; payload: CanvasElement }
  | { type: 'DELETE_ELEMENT'; payload: string }
  | { type: 'UPDATE_ELEMENT'; payload: { id: string; updates: Partial<CanvasElement> } }
  | { type: 'SELECT_ELEMENTS'; payload: string[] }
  | { type: 'SET_TOOL'; payload: CanvasState['tool'] }
  | { type: 'SET_TRANSFORM'; payload: CanvasState['transform'] }
  | { type: 'PUSH_HISTORY'; payload: CanvasElement[] }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'BATCH_UPDATE'; payload: { elements: CanvasElement[]; selectedIds: string[]; propElId: string | null } };

export class CanvasStateManager {
  private state: CanvasState;
  private listeners: Set<(state: CanvasState) => void> = new Set();
  private readonly SAVE_KEY = 'flowboard_v2';

  constructor(initialState?: Partial<CanvasState>) {
    this.state = {
      elements: [],
      selectedIds: [],
      transform: { x: 0, y: 0, scale: 1 },
      boardTitle: 'Nouveau tableau',
      bgStyle: 'dots',
      tool: 'select',
      color: '#FFFBEB',
      penColor: '#1F2937',
      penWidth: 3,
      history: [[]],
      historyIndex: 0,
      showColors: false,
      editingId: null,
      editContent: '',
      propElId: null,
      showPropPanel: false,
      showSettings: false,
      showSearch: false,
      showTemplates: false,
      showTimer: false,
      presentMode: false,
      selectionBox: null,
      dragOver: false,
      contextMenu: null,
      connectorStart: null,
      connectorPreview: null,
      editingConnectorId: null,
      connectorEditContent: '',
      currentPath: null,
      searchQuery: '',
      searchMatchIds: [],
      activeTagFilter: null,
      timerSeconds: 300,
      timerRunning: false,
      timerElapsed: 0,
      collaboratorCursors: [],
      toasts: [],
      activities: [],
      ...initialState,
    };
  }

  getState(): CanvasState {
    return { ...this.state };
  }

  subscribe(listener: (state: CanvasState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
    this.saveState();
  }

  dispatch(action: CanvasAction) {
    switch (action.type) {
      case 'ADD_ELEMENT':
        this.state.elements.push(action.payload);
        this.pushHistory();
        break;

      case 'DELETE_ELEMENT':
        this.state.elements = this.state.elements.filter(el => el.id !== action.payload);
        this.state.selectedIds = this.state.selectedIds.filter(id => id !== action.payload);
        this.pushHistory();
        break;

      case 'UPDATE_ELEMENT':
        this.state.elements = this.state.elements.map(el =>
          el.id === action.payload.id ? { ...el, ...action.payload.updates } : el
        );
        break;

      case 'SELECT_ELEMENTS':
        this.state.selectedIds = action.payload;
        this.state.propElId = action.payload.length === 1 ? action.payload[0] : null;
        break;

      case 'SET_TOOL':
        this.state.tool = action.payload;
        break;

      case 'SET_TRANSFORM':
        this.state.transform = action.payload;
        break;

      case 'PUSH_HISTORY':
        this.state.history = this.state.history.slice(0, this.state.historyIndex + 1);
        this.state.history.push(action.payload.map(el => ({ ...el })));
        this.state.historyIndex = this.state.history.length - 1;
        break;

      case 'UNDO':
        if (this.state.historyIndex > 0) {
          this.state.historyIndex--;
          this.state.elements = this.state.history[this.state.historyIndex].map(el => ({ ...el }));
          this.state.selectedIds = [];
        }
        break;

      case 'REDO':
        if (this.state.historyIndex < this.state.history.length - 1) {
          this.state.historyIndex++;
          this.state.elements = this.state.history[this.state.historyIndex].map(el => ({ ...el }));
          this.state.selectedIds = [];
        }
        break;

      case 'BATCH_UPDATE':
        this.state.elements = action.payload.elements;
        this.state.selectedIds = action.payload.selectedIds;
        this.state.propElId = action.payload.propElId;
        this.pushHistory();
        break;
    }

    this.notifyListeners();
  }

  private pushHistory() {
    this.state.history = this.state.history.slice(0, this.state.historyIndex + 1);
    this.state.history.push(this.state.elements.map(el => ({ ...el })));
    this.state.historyIndex = this.state.history.length - 1;
  }

  private saveState() {
    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify({
        elements: this.state.elements,
        boardTitle: this.state.boardTitle,
      }));
    } catch (_) {
      // Silently fail if storage unavailable
    }
  }

  loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.SAVE_KEY) || 'null');
      if (saved && Array.isArray(saved.elements)) {
        this.state.elements = saved.elements;
        this.state.boardTitle = saved.boardTitle || this.state.boardTitle;
        this.state.history = [saved.elements.map(el => ({ ...el }))];
        this.notifyListeners();
      }
    } catch (_) {
      // Silently fail if parsing error
    }
  }

  // Convenience methods
  addElement(element: CanvasElement) {
    this.dispatch({ type: 'ADD_ELEMENT', payload: element });
  }

  deleteElement(id: string) {
    this.dispatch({ type: 'DELETE_ELEMENT', payload: id });
  }

  updateElement(id: string, updates: Partial<CanvasElement>) {
    this.dispatch({ type: 'UPDATE_ELEMENT', payload: { id, updates } });
  }

  selectElements(ids: string[]) {
    this.dispatch({ type: 'SELECT_ELEMENTS', payload: ids });
  }

  setTool(tool: CanvasState['tool']) {
    this.dispatch({ type: 'SET_TOOL', payload: tool });
  }

  undo() {
    this.dispatch({ type: 'UNDO' });
  }

  redo() {
    this.dispatch({ type: 'REDO' });
  }

  canUndo(): boolean {
    return this.state.historyIndex > 0;
  }

  canRedo(): boolean {
    return this.state.historyIndex < this.state.history.length - 1;
  }
}
