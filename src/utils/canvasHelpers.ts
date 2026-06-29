/**
 * FLOWBOARD v2 — Canvas Utilities & Helpers
 * Fonctions pures pour les opérations courantes
 */

import type { CanvasElement } from '../state/CanvasStateManager';

// ─── SMOOTH PATH (Pen drawing)
export const smoothPath = (points: [number, number][]): string => {
  if (!points || points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]}`;
  }
  
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i++) {
    const mx = (points[i][0] + points[i + 1][0]) / 2;
    const my = (points[i][1] + points[i + 1][1]) / 2;
    d += ` Q ${points[i][0]} ${points[i][1]} ${mx} ${my}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last[0]} ${last[1]}`;
  return d;
};

// ─── SCREEN TO CANVAS COORDINATES
export const screenToCanvas = (
  clientX: number,
  clientY: number,
  canvasRect: DOMRect,
  transform: { x: number; y: number; scale: number }
): { x: number; y: number } => {
  const x = (clientX - canvasRect.left - transform.x) / transform.scale;
  const y = (clientY - canvasRect.top - transform.y) / transform.scale;
  return { x, y };
};

// ─── CANVAS TO SCREEN COORDINATES
export const canvasToScreen = (
  canvasX: number,
  canvasY: number,
  canvasRect: DOMRect,
  transform: { x: number; y: number; scale: number }
): { x: number; y: number } => {
  const x = canvasX * transform.scale + transform.x + canvasRect.left;
  const y = canvasY * transform.scale + transform.y + canvasRect.top;
  return { x, y };
};

// ─── BOUNDING BOX
export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export const getBoundingBox = (elements: CanvasElement[]): BoundingBox | null => {
  if (!elements.length) return null;
  
  const xs = elements.map(el => el.x);
  const ys = elements.map(el => el.y);
  const maxXs = elements.map(el => el.x + el.width);
  const maxYs = elements.map(el => el.y + el.height);
  
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...maxXs);
  const maxY = Math.max(...maxYs);
  
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

// ─── COLLISION DETECTION
export const elementContainsPoint = (
  element: CanvasElement,
  x: number,
  y: number
): boolean => {
  return x >= element.x && x <= element.x + element.width &&
         y >= element.y && y <= element.y + element.height;
};

export const elementsIntersect = (el1: CanvasElement, el2: CanvasElement): boolean => {
  return !(el1.x + el1.width < el2.x ||
           el2.x + el2.width < el1.x ||
           el1.y + el1.height < el2.y ||
           el2.y + el2.height < el1.y);
};

// ─── SELECTION BOX
export const getSelectionBoxElements = (
  elements: CanvasElement[],
  sx: number,
  sy: number,
  ex: number,
  ey: number
): string[] => {
  const minX = Math.min(sx, ex);
  const minY = Math.min(sy, ey);
  const maxX = Math.max(sx, ex);
  const maxY = Math.max(sy, ey);
  
  return elements
    .filter(el => el.x < maxX && el.x + el.width > minX &&
                  el.y < maxY && el.y + el.height > minY)
    .map(el => el.id);
};

// ─── CONNECTOR ARROW HEAD
export const getArrowHeadPath = (x1: number, y1: number, x2: number, y2: number): string => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const L = 13;
  const spread = Math.PI / 7;
  const ax1 = x2 - L * Math.cos(angle - spread);
  const ay1 = y2 - L * Math.sin(angle - spread);
  const ax2 = x2 - L * Math.cos(angle + spread);
  const ay2 = y2 - L * Math.sin(angle + spread);
  return `${x2},${y2} ${ax1},${ay1} ${ax2},${ay2}`;
};

// ─── RELATIVE TIME
export const relativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}j`;
  
  const date = new Date(timestamp);
  return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
};

// ─── ELEMENT SIZING DEFAULTS
export const DEFAULT_SIZES = {
  sticky: { width: 200, height: 200 },
  text: { width: 220, height: 48 },
  rect: { width: 200, height: 120 },
  circle: { width: 120, height: 120 },
  comment: { width: 32, height: 32 },
} as const;

// ─── STICKY COLOR PALETTE
export const STICKY_COLOR_MAP: Record<string, { bg: string; border: string }> = {
  '#FFFBEB': { bg: '#FFFBEB', border: '#FDE68A' },
  '#F0FDF4': { bg: '#F0FDF4', border: '#86EFAC' },
  '#FFF1F2': { bg: '#FFF1F2', border: '#FECACA' },
  '#EFF6FF': { bg: '#EFF6FF', border: '#BFDBFE' },
  '#FAF5FF': { bg: '#FAF5FF', border: '#E9D5FF' },
  '#FFF7ED': { bg: '#FFF7ED', border: '#FED7AA' },
  '#ECFDF5': { bg: '#ECFDF5', border: '#A7F3D0' },
  '#F8FAFC': { bg: '#F8FAFC', border: '#CBD5E1' },
};

// ─── GENERATE UNIQUE ID
export const generateId = (prefix = 'el'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ─── EXPORT HELPERS
export const exportToJSON = (elements: CanvasElement[], boardTitle: string): string => {
  return JSON.stringify(
    {
      version: 2,
      boardTitle,
      elements: elements.map(({ isNew, ...el }) => el),
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
};

export const importFromJSON = (jsonString: string): { elements: CanvasElement[]; boardTitle: string } | null => {
  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data.elements)) return null;
    return {
      elements: data.elements,
      boardTitle: data.boardTitle || 'Tableau importé',
    };
  } catch {
    return null;
  }
};

// ─── CANVAS EXPORT (PNG)
export interface ExportPNGOptions {
  padding?: number;
  backgroundColor?: string;
  gridColor?: string;
  quality?: number;
}

export const renderToPNG = async (
  elements: CanvasElement[],
  options: ExportPNGOptions = {}
): Promise<Blob> => {
  const {
    padding = 48,
    backgroundColor = '#F1F3F6',
    gridColor = 'rgba(99,102,241,0.14)',
    quality = 0.95,
  } = options;

  const items = elements.filter(el => el.type !== 'connector');
  if (!items.length) throw new Error('Aucun élément à exporter');

  const bbox = getBoundingBox(items);
  if (!bbox) throw new Error('Impossible de calculer les dimensions');

  const W = bbox.width + padding * 2;
  const H = bbox.height + padding * 2;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Impossible d\'accéder au contexte canvas');

  // Background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.fillStyle = gridColor;
  for (let gx = 0; gx < W; gx += 24) {
    for (let gy = 0; gy < H; gy += 24) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // TODO: Render elements (simplified for now)
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob || new Blob());
    }, 'image/png', quality);
  });
};
