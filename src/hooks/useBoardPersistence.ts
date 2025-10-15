import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CanvasElement } from "@/components/Canvas/Canvas";
import type { Connection } from "@/components/Canvas/ConnectionSystem";
import type { DrawingStroke } from "@/components/Canvas/DrawingTool";

const STORAGE_PREFIX = "collab-board::";
const STORAGE_VERSION = 1;
const FALLBACK_BOARD_ID = "default";

export interface StoredBoardSnapshot {
  version: number;
  boardTitle: string;
  elements: CanvasElement[];
  connections: Connection[];
  drawingStrokes: DrawingStroke[];
  updatedAt: string;
}

interface UseBoardPersistenceOptions {
  boardId?: string;
  elements: CanvasElement[];
  connections: Connection[];
  drawingStrokes: DrawingStroke[];
  boardTitle: string;
  onLoad: (snapshot: StoredBoardSnapshot) => void;
}

interface UseBoardPersistenceResult {
  lastSavedAt: Date | null;
  isSaving: boolean;
  hasSnapshot: boolean;
  saveNow: () => void;
  resetBoard: () => void;
  storageKey: string;
}

const getStorageKey = (boardId?: string) => `${STORAGE_PREFIX}${boardId ?? FALLBACK_BOARD_ID}`;

export const useBoardPersistence = ({
  boardId,
  elements,
  connections,
  drawingStrokes,
  boardTitle,
  onLoad,
}: UseBoardPersistenceOptions): UseBoardPersistenceResult => {
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSnapshot, setHasSnapshot] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const payloadRef = useRef<string>("");
  const timeoutRef = useRef<number | null>(null);
  const storageKey = useMemo(() => getStorageKey(boardId), [boardId]);

  const clearPendingSave = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearPendingSave();
    };
  }, [clearPendingSave]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredBoardSnapshot;
        payloadRef.current = JSON.stringify({
          elements: parsed.elements ?? [],
          connections: parsed.connections ?? [],
          drawingStrokes: parsed.drawingStrokes ?? [],
          boardTitle: parsed.boardTitle ?? "",
        });

        setHasSnapshot(true);
        setLastSavedAt(parsed.updatedAt ? new Date(parsed.updatedAt) : null);
        onLoad(parsed);
      } else {
        payloadRef.current = JSON.stringify({
          elements: [],
          connections: [],
          drawingStrokes: [],
          boardTitle: "",
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement du tableau depuis le stockage local:", error);
    } finally {
      setHasLoaded(true);
    }
  }, [storageKey, onLoad]);

  const persistSnapshot = useCallback(
    (payloadString: string, snapshot: StoredBoardSnapshot) => {
      if (typeof window === "undefined") return;

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
        payloadRef.current = payloadString;
        setLastSavedAt(new Date(snapshot.updatedAt));
        setHasSnapshot(true);
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du tableau:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [storageKey]
  );

  const scheduleSave = useCallback(
    (immediate = false) => {
      if (!hasLoaded) return;
      if (typeof window === "undefined") return;

      const payload = {
        elements,
        connections,
        drawingStrokes,
        boardTitle,
      };
      const payloadString = JSON.stringify(payload);

      if (payloadString === payloadRef.current) {
        return;
      }

      const snapshot: StoredBoardSnapshot = {
        version: STORAGE_VERSION,
        boardTitle,
        elements,
        connections,
        drawingStrokes,
        updatedAt: new Date().toISOString(),
      };

      clearPendingSave();
      setIsSaving(true);

      if (immediate) {
        persistSnapshot(payloadString, snapshot);
        return;
      }

      timeoutRef.current = window.setTimeout(() => {
        persistSnapshot(payloadString, snapshot);
        timeoutRef.current = null;
      }, 600);
    },
    [boardTitle, clearPendingSave, connections, drawingStrokes, elements, hasLoaded, persistSnapshot]
  );

  useEffect(() => {
    scheduleSave(false);
  }, [scheduleSave]);

  const saveNow = useCallback(() => {
    scheduleSave(true);
  }, [scheduleSave]);

  const resetBoard = useCallback(() => {
    if (typeof window === "undefined") return;

    clearPendingSave();
    try {
      window.localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du tableau:", error);
    }
    payloadRef.current = JSON.stringify({
      elements: [],
      connections: [],
      drawingStrokes: [],
      boardTitle: "",
    });
    setHasSnapshot(false);
    setLastSavedAt(null);
    setIsSaving(false);
  }, [clearPendingSave, storageKey]);

  return {
    lastSavedAt,
    isSaving,
    hasSnapshot,
    saveNow,
    resetBoard,
    storageKey,
  };
};
