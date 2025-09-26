import { useState, useCallback, useRef } from "react";
import { CanvasElement } from "../Canvas";

export interface HistoryState {
  elements: CanvasElement[];
  timestamp: number;
}

export const useHistory = (initialElements: CanvasElement[] = []) => {
  const [history, setHistory] = useState<HistoryState[]>([
    { elements: initialElements, timestamp: Date.now() }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const maxHistorySize = 50;

  // Track if we're currently in an undo/redo operation to prevent infinite loops
  const isUndoRedoOperation = useRef(false);

  const addToHistory = useCallback((elements: CanvasElement[]) => {
    if (isUndoRedoOperation.current) return;

    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push({ elements: [...elements], timestamp: Date.now() });
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        setCurrentIndex(prev => Math.max(0, prev - 1));
        return newHistory;
      }
      
      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [currentIndex]);

  const undo = useCallback((): CanvasElement[] | null => {
    if (currentIndex <= 0) return null;

    isUndoRedoOperation.current = true;
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    
    setTimeout(() => {
      isUndoRedoOperation.current = false;
    }, 0);

    return history[newIndex].elements;
  }, [currentIndex, history]);

  const redo = useCallback((): CanvasElement[] | null => {
    if (currentIndex >= history.length - 1) return null;

    isUndoRedoOperation.current = true;
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    
    setTimeout(() => {
      isUndoRedoOperation.current = false;
    }, 0);

    return history[newIndex].elements;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const getCurrentElements = useCallback(() => {
    return history[currentIndex]?.elements || [];
  }, [history, currentIndex]);

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    getCurrentElements,
  };
};