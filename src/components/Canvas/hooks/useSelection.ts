import { useState, useCallback, useRef } from "react";

export interface SelectionState {
  selectedIds: string[];
  selectionBox: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    isActive: boolean;
  };
}

export const useSelection = () => {
  const [selection, setSelection] = useState<SelectionState>({
    selectedIds: [],
    selectionBox: {
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      isActive: false,
    },
  });

  const selectElement = useCallback((id: string, multiSelect = false) => {
    setSelection(prev => ({
      ...prev,
      selectedIds: multiSelect 
        ? prev.selectedIds.includes(id) 
          ? prev.selectedIds.filter(selectedId => selectedId !== id)
          : [...prev.selectedIds, id]
        : [id]
    }));
  }, []);

  const selectMultiple = useCallback((ids: string[]) => {
    setSelection(prev => ({
      ...prev,
      selectedIds: ids
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(prev => ({
      ...prev,
      selectedIds: []
    }));
  }, []);

  const startSelectionBox = useCallback((x: number, y: number) => {
    setSelection(prev => ({
      ...prev,
      selectionBox: {
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        isActive: true,
      }
    }));
  }, []);

  const updateSelectionBox = useCallback((x: number, y: number) => {
    setSelection(prev => ({
      ...prev,
      selectionBox: {
        ...prev.selectionBox,
        endX: x,
        endY: y,
      }
    }));
  }, []);

  const endSelectionBox = useCallback(() => {
    setSelection(prev => ({
      ...prev,
      selectionBox: {
        ...prev.selectionBox,
        isActive: false,
      }
    }));
  }, []);

  const isSelected = useCallback((id: string) => {
    return selection.selectedIds.includes(id);
  }, [selection.selectedIds]);

  return {
    selection,
    selectElement,
    selectMultiple,
    clearSelection,
    startSelectionBox,
    updateSelectionBox,
    endSelectionBox,
    isSelected,
  };
};