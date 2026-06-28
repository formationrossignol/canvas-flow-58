import { useState } from "react";
import { Copy, Trash2, Lock, Unlock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CanvasElement } from "./Canvas";

interface ContextualBarProps {
  selectedElements: CanvasElement[];
  canvasTransform: { x: number; y: number; scale: number };
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const QUICK_COLORS = ['#FFE066', '#FF8A80', '#81C784', '#64B5F6', '#FFB74D'];
const ALL_COLORS = [
  '#FFE066', '#FF8A80', '#81C784', '#64B5F6',
  '#FFB74D', '#E1BEE7', '#A5D6A7', '#F48FB1',
  '#90CAF9', '#FFCC02', '#FF5722', '#4CAF50',
  '#2196F3', '#FF9800', '#9C27B0', '#ffffff',
];
const HEADER_HEIGHT = 48;
const BAR_HEIGHT = 44;

function getBoundingBox(elements: CanvasElement[]) {
  const minX = Math.min(...elements.map(el => el.x));
  const minY = Math.min(...elements.map(el => el.y));
  const maxX = Math.max(...elements.map(el => el.x + el.width));
  return { minX, minY, midX: (minX + maxX) / 2 };
}

export const ContextualBar = ({
  selectedElements,
  canvasTransform,
  onUpdate,
  onDelete,
  onDuplicate,
}: ContextualBarProps) => {
  const [showAllColors, setShowAllColors] = useState(false);
  const [showOpacitySlider, setShowOpacitySlider] = useState(false);

  if (!selectedElements.length) return null;

  const { midX, minY } = getBoundingBox(selectedElements);
  const { x: panX, y: panY, scale } = canvasTransform;

  const screenCenterX = midX * scale + panX;
  const screenTopY = minY * scale + panY;

  const barTop = screenTopY - BAR_HEIGHT - 12;
  const clampedTop = Math.max(HEADER_HEIGHT + 8, barTop);

  const isMulti = selectedElements.length > 1;
  const first = selectedElements[0];
  const isText = first.type === 'text';
  const isLocked = selectedElements.every(el => el.locked);
  const sharedColor = isMulti
    ? (selectedElements.every(el => el.color === first.color) ? first.color : null)
    : first.color;

  const updateAll = (updates: Partial<CanvasElement>) =>
    selectedElements.forEach(el => onUpdate(el.id, updates));

  const handleColorClick = (color: string) => {
    updateAll({ color });
    setShowAllColors(false);
  };

  const handleFontSizeStep = (delta: number) => {
    const current = first.fontSize ?? 14;
    updateAll({ fontSize: Math.max(8, Math.min(96, current + delta)) });
  };

  return (
    <div
      className="fixed z-30 pointer-events-none"
      style={{ left: screenCenterX, top: clampedTop, transform: 'translateX(-50%)' }}
    >
      <div className="pointer-events-auto flex items-center gap-1 bg-card border border-border rounded-xl shadow-float px-2 py-1.5 whitespace-nowrap">

        {/* Text controls */}
        {isText && !isMulti && (
          <>
            <div className="flex items-center gap-0.5 bg-muted rounded-md px-1">
              <button
                className="w-5 h-5 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => handleFontSizeStep(-2)}
              >−</button>
              <span className="text-xs font-semibold text-foreground px-1 min-w-[24px] text-center">
                {first.fontSize ?? 14}
              </span>
              <button
                className="w-5 h-5 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => handleFontSizeStep(2)}
              >+</button>
            </div>
            <div className="w-px h-5 bg-border mx-0.5" />
            <button
              className={`w-7 h-7 flex items-center justify-center rounded text-sm font-bold transition-colors ${first.textStyle?.fontWeight === 'bold' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              onClick={() => updateAll({ textStyle: { ...first.textStyle, fontWeight: first.textStyle?.fontWeight === 'bold' ? 'normal' : 'bold' } })}
              title="Gras"
            >B</button>
            <button
              className={`w-7 h-7 flex items-center justify-center rounded text-sm italic transition-colors ${first.textStyle?.fontStyle === 'italic' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              onClick={() => updateAll({ textStyle: { ...first.textStyle, fontStyle: first.textStyle?.fontStyle === 'italic' ? 'normal' : 'italic' } })}
              title="Italique"
            >I</button>
            <div className="w-px h-5 bg-border mx-0.5" />
          </>
        )}

        {/* Color swatches */}
        <div className="flex items-center gap-1">
          {QUICK_COLORS.map(color => (
            <button
              key={color}
              className={`w-5 h-5 rounded transition-transform hover:scale-110 ${
                sharedColor === color ? 'ring-2 ring-primary ring-offset-1' : ''
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorClick(color)}
              title={color}
            />
          ))}
          {/* More colors */}
          <div className="relative">
            <button
              className="w-5 h-5 rounded border border-dashed border-muted-foreground flex items-center justify-center hover:border-foreground transition-colors"
              onClick={() => setShowAllColors(v => !v)}
              title="Plus de couleurs"
            >
              <ChevronDown size={10} className="text-muted-foreground" />
            </button>
            {showAllColors && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl p-2 shadow-float grid grid-cols-4 gap-1.5 z-50">
                {ALL_COLORS.map(color => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded transition-transform hover:scale-110 border ${
                      sharedColor === color ? 'border-primary scale-110' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorClick(color)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Opacity */}
        <div className="w-px h-5 bg-border mx-0.5" />
        <div className="relative">
          <button
            className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            onClick={() => setShowOpacitySlider(p => !p)}
            title="Opacité"
          >
            {Math.round((first.opacity ?? 1) * 100)}%
          </button>
          {showOpacitySlider && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg p-2 shadow-float z-50">
              <input
                type="range" min={0} max={100}
                value={Math.round((first.opacity ?? 1) * 100)}
                onChange={e => updateAll({ opacity: Number(e.target.value) / 100 })}
                className="w-24 accent-purple-400"
              />
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-border mx-0.5" />

        {/* Lock */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          onClick={() => updateAll({ locked: !isLocked })}
          title={isLocked ? 'Déverrouiller' : 'Verrouiller'}
        >
          {isLocked ? <Unlock size={13} /> : <Lock size={13} />}
        </Button>

        {/* Duplicate */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          onClick={() => selectedElements.forEach(el => onDuplicate(el.id))}
          title="Dupliquer (⌘D)"
        >
          <Copy size={13} />
        </Button>

        {/* Delete */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
          onClick={() => selectedElements.forEach(el => onDelete(el.id))}
          title="Supprimer (⌫)"
        >
          <Trash2 size={13} />
        </Button>
      </div>
    </div>
  );
};
