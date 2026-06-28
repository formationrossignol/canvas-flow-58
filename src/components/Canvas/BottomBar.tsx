// src/components/Canvas/BottomBar.tsx
import { Undo2, Redo2, Minus, Plus, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BottomBarProps {
  canUndo: boolean;
  canRedo: boolean;
  scale: number;
  onUndo: () => void;
  onRedo: () => void;
  onZoomChange: (scale: number) => void;
  onFitToScreen: () => void;
}

const MIN_SCALE = 0.1;
const MAX_SCALE = 3;

export const BottomBar = ({
  canUndo,
  canRedo,
  scale,
  onUndo,
  onRedo,
  onZoomChange,
  onFitToScreen,
}: BottomBarProps) => {
  const [editingZoom, setEditingZoom] = useState(false);
  const [zoomInput, setZoomInput] = useState('');

  const zoomPercent = Math.round(scale * 100);

  const handleZoomIn = () =>
    onZoomChange(Math.min(MAX_SCALE, scale * 1.2));

  const handleZoomOut = () =>
    onZoomChange(Math.max(MIN_SCALE, scale / 1.2));

  const handleZoomCommit = () => {
    const val = parseInt(zoomInput, 10);
    if (!isNaN(val) && val >= 10 && val <= 300) {
      onZoomChange(val / 100);
    }
    setEditingZoom(false);
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20">
      <div className="flex items-center gap-1 bg-card border border-border rounded-xl shadow-float px-3 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="w-7 h-7 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
          onClick={onUndo}
          disabled={!canUndo}
          title="Annuler (Ctrl+Z)"
        >
          <Undo2 size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-7 h-7 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
          onClick={onRedo}
          disabled={!canRedo}
          title="Refaire (Ctrl+Y)"
        >
          <Redo2 size={14} />
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        <Button
          variant="ghost"
          size="sm"
          className="w-7 h-7 p-0 text-muted-foreground hover:text-foreground"
          onClick={handleZoomOut}
          title="Zoom arrière"
        >
          <Minus size={14} />
        </Button>

        {editingZoom ? (
          <input
            autoFocus
            className="w-14 text-center text-xs font-semibold bg-muted rounded-md px-1 py-0.5 outline-none border border-primary"
            value={zoomInput}
            onChange={e => setZoomInput(e.target.value)}
            onBlur={handleZoomCommit}
            onKeyDown={e => {
              if (e.key === 'Enter') handleZoomCommit();
              if (e.key === 'Escape') setEditingZoom(false);
            }}
          />
        ) : (
          <button
            className="w-14 text-center text-xs font-semibold text-foreground bg-muted hover:bg-accent rounded-md px-1 py-0.5 transition-colors"
            onClick={() => { setZoomInput(String(zoomPercent)); setEditingZoom(true); }}
            title="Cliquer pour saisir un zoom exact"
          >
            {zoomPercent}%
          </button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-7 h-7 p-0 text-muted-foreground hover:text-foreground"
          onClick={handleZoomIn}
          title="Zoom avant"
        >
          <Plus size={14} />
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        <Button
          variant="ghost"
          size="sm"
          className="w-7 h-7 p-0 text-muted-foreground hover:text-foreground"
          onClick={onFitToScreen}
          title="Ajuster à l'écran (Ctrl+Shift+H)"
        >
          <Maximize2 size={14} />
        </Button>
      </div>
    </div>
  );
};
