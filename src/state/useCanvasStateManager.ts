import { useState, useRef, useEffect, useCallback } from 'react';
import { CanvasStateManager } from './CanvasStateManager';

export function useCanvasStateManager<T extends object>() {
  const storeRef = useRef(new CanvasStateManager());
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });

  useEffect(() => {
    const store = storeRef.current;
    return store.subscribe(() => {
      setHistoryState({ canUndo: store.canUndo(), canRedo: store.canRedo() });
    });
  }, []);

  const addToHistory = useCallback((elements: T[]) => {
    storeRef.current.dispatch({ type: 'PUSH_HISTORY', payload: elements as any });
  }, []);

  const undo = useCallback((): T[] | null => {
    const store = storeRef.current;
    if (!store.canUndo()) return null;
    store.undo();
    return store.getState().elements as unknown as T[];
  }, []);

  const redo = useCallback((): T[] | null => {
    const store = storeRef.current;
    if (!store.canRedo()) return null;
    store.redo();
    return store.getState().elements as unknown as T[];
  }, []);

  const resetHistory = useCallback((elements: T[]) => {
    const internalState = (storeRef.current as any).state;
    internalState.history = [elements.map((el: any) => ({ ...el }))];
    internalState.historyIndex = 0;
    setHistoryState({ canUndo: false, canRedo: false });
  }, []);

  return {
    addToHistory,
    undo,
    redo,
    canUndo: historyState.canUndo,
    canRedo: historyState.canRedo,
    resetHistory,
  };
}
