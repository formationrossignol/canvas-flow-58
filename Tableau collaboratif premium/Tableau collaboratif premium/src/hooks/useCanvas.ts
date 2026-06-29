/**
 * FLOWBOARD v2 — Custom Hooks
 * État local & logique réutilisable
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CanvasElement } from '../state/CanvasStateManager';

// ─── useSelection
export const useSelection = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = useCallback((id: string, multi = false) => {
    setSelectedIds(prev => {
      if (multi) {
        return prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id];
      }
      return prev.includes(id) ? prev : [id];
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const selectSingle = useCallback((id: string) => setSelectedIds([id]), []);

  return {
    selectedIds,
    setSelectedIds,
    toggleSelection,
    clearSelection,
    selectSingle,
    hasSelection: selectedIds.length > 0,
    isSelected: (id: string) => selectedIds.includes(id),
  };
};

// ─── useHistory
export const useHistory = <T extends any[]>(initialValue: T) => {
  const [history, setHistory] = useState<T[]>([initialValue]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const push = useCallback((value: T) => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), value]);
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    setHistoryIndex(prev => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setHistoryIndex(prev => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  const current = history[historyIndex];
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return { current, push, undo, redo, canUndo, canRedo };
};

// ─── useDrag
export interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
}

export const useDrag = (onDragStart?: () => void, onDragEnd?: () => void) => {
  const [state, setState] = useState<DragState | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    onDragStart?.();
    setState({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      deltaX: 0,
      deltaY: 0,
    });
  }, [onDragStart]);

  useEffect(() => {
    if (!state?.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          currentX: e.clientX,
          currentY: e.clientY,
          deltaX: e.clientX - prev.startX,
          deltaY: e.clientY - prev.startY,
        };
      });
    };

    const handleMouseUp = () => {
      setState(null);
      onDragEnd?.();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [state?.isDragging, onDragEnd]);

  return { ...state, handleMouseDown };
};

// ─── useElementResize
export interface ResizeState {
  isResizing: boolean;
  handle: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startLeft: number;
  startTop: number;
}

export const useElementResize = () => {
  const [state, setState] = useState<ResizeState | null>(null);

  const startResize = useCallback((
    handle: string,
    e: React.MouseEvent,
    element: { x: number; y: number; width: number; height: number }
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setState({
      isResizing: true,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: element.width,
      startHeight: element.height,
      startLeft: element.x,
      startTop: element.y,
    });
  }, []);

  useEffect(() => {
    if (!state?.isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Logic delegated to component using this hook
    };

    const handleMouseUp = () => {
      setState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [state?.isResizing]);

  return { ...state, startResize };
};

// ─── useDebounce
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// ─── useToast
export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'success',
    duration = 3000
  ) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  return { toasts, addToast };
};

// ─── useLocalStorage
export const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
};

// ─── useKeyboardShortcuts
export const useKeyboardShortcuts = (shortcuts: Record<string, (e: KeyboardEvent) => void>) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = `${e.ctrlKey || e.metaKey ? 'ctrl+' : ''}${e.key.toLowerCase()}`;
      shortcuts[key]?.(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
