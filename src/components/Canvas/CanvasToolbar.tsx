import {
  MousePointer2, Hand, StickyNote, Type, Square, Circle, Smile,
  Pen, Eraser, MessageCircle, Share2, Undo2, Redo2,
  Clock, Download, FileJson2, Upload, Settings,
} from "lucide-react";
import { CanvasElement } from "./Canvas";
import { useState } from "react";
import { STICKY_COLORS, COLORS } from "@/tokens/colors";
import { ColorSwatch, Divider } from "@/components/UI/SharedComponents";

interface CanvasToolbarProps {
  selectedTool: string;
  selectedColor: string;
  brushThickness: number;
  onToolSelect: (tool: string) => void;
  onColorSelect: (color: string) => void;
  onBrushThicknessChange: (thickness: number) => void;
  onAddElement: (type: CanvasElement['type']) => void;
  isConnecting: boolean;
  onToggleConnecting: () => void;
  isTimerVisible: boolean;
  onToggleTimer: () => void;
  onToggleTextEditor: () => void;
  onToggleOptions: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onInsertEmoji?: (emoji: string) => void;
  onExportPNG?: () => void;
  onExportJSON?: () => void;
  onImportJSON?: () => void;
  onOpenShortcuts?: () => void;
}

const SEP = () => <Divider vertical />;

const TB_BTN_BASE: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 9, background: 'none', border: 'none',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#374151', transition: 'background 0.12s',
  flexShrink: 0,
};

const TB_BTN_ACTIVE: React.CSSProperties = {
  ...TB_BTN_BASE,
  background: 'rgba(79,70,229,0.10)',
  color: '#4F46E5',
};

const COLOR_GROUPS = [
  {
    label: 'Pastels',
    colors: STICKY_COLORS.map(c => ({ hex: c.bg, label: c.label })),
  },
  {
    label: 'Couleurs',
    colors: [
      { hex: COLORS.primary[500], label: 'Indigo' },
      { hex: COLORS.secondary[500], label: 'Violet' },
      { hex: COLORS.accent[500], label: 'Turquoise' },
      { hex: COLORS.success[500], label: 'Vert' },
      { hex: COLORS.warning[500], label: 'Ambre' },
      { hex: COLORS.danger[500], label: 'Rouge' },
      { hex: '#3B82F6', label: 'Bleu' },
      { hex: '#F97316', label: 'Orange' },
    ],
  },
  {
    label: 'Nuances',
    colors: [
      { hex: '#0F172A', label: 'Nuit' },
      { hex: '#64748B', label: 'Ardoise' },
      { hex: '#CBD5E1', label: 'Gris' },
      { hex: '#FFFFFF', label: 'Blanc' },
    ],
  },
];

const emojis = ['😀','😂','🎉','❤️','👍','🔥','💡','⭐','🎯','✅','🚀','🙏','🎨','🏆','💪','🌟','🤔','😍','🤝','💯','🧠','⚡','🌈','🦄'];

const penSizes = [
  { size: 2, label: 'S', dot: 4 },
  { size: 5, label: 'M', dot: 7 },
  { size: 12, label: 'L', dot: 11 },
];

export const CanvasToolbar = ({
  selectedTool, selectedColor, brushThickness,
  onToolSelect, onColorSelect, onBrushThicknessChange,
  onAddElement, isConnecting, onToggleConnecting,
  isTimerVisible, onToggleTimer, onToggleTextEditor,
  canUndo = false, canRedo = false, onUndo, onRedo,
  onInsertEmoji, onExportPNG, onExportJSON, onImportJSON, onOpenShortcuts,
}: CanvasToolbarProps) => {
  const [showColors, setShowColors] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const activeTool = isConnecting ? 'connect' : selectedTool;

  const toolBtn = (id: string) => activeTool === id ? TB_BTN_ACTIVE : TB_BTN_BASE;

  const handleTool = (id: string) => {
    if (id === 'connect') { onToggleConnecting(); return; }
    if (id === 'timer') { onToggleTimer(); return; }
    onToolSelect(id);
    if (!['select', 'hand', 'pen', 'eraser'].includes(id)) {
      onAddElement(id as CanvasElement['type']);
    }
    setShowColors(false);
    setShowEmoji(false);
  };

  return (
    <div
      style={{
        position: 'absolute', bottom: 24, left: '50%', zIndex: 10,
        animation: 'toolbar-in 0.45s cubic-bezier(0.175,0.885,0.32,1.275) both',
      }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 1,
          background: 'rgba(255,255,255,0.97)',
          border: '1px solid rgba(15,23,42,0.07)',
          borderRadius: 14, padding: 6,
          boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 white',
        }}
      >
        {/* Select + Hand */}
        <button style={toolBtn('select')} onClick={() => handleTool('select')} title="Sélection (V)">
          <MousePointer2 size={17} />
        </button>
        <button style={toolBtn('hand')} onClick={() => handleTool('hand')} title="Main (H)">
          <Hand size={17} />
        </button>

        <SEP />

        {/* Shape tools */}
        <button style={toolBtn('sticky')} onClick={() => handleTool('sticky')} title="Post-it (S)">
          <StickyNote size={17} />
        </button>
        <button style={toolBtn('text')} onClick={() => { onToolSelect('text'); onToggleTextEditor(); onAddElement('text'); }} title="Texte (T)">
          <Type size={17} />
        </button>
        <button style={toolBtn('rectangle')} onClick={() => handleTool('rectangle')} title="Rectangle (R)">
          <Square size={17} />
        </button>
        <button style={toolBtn('circle')} onClick={() => handleTool('circle')} title="Cercle (C)">
          <Circle size={17} />
        </button>

        {/* Emoji picker */}
        <div style={{ position: 'relative' }}>
          <button
            style={showEmoji ? TB_BTN_ACTIVE : TB_BTN_BASE}
            onClick={() => { setShowEmoji(!showEmoji); setShowColors(false); }}
            title="Emoji / Sticker"
          >
            <Smile size={17} />
          </button>
          {showEmoji && (
            <div
              style={{
                position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%',
                transform: 'translateX(-50%)',
                background: 'white', border: '1px solid rgba(15,23,42,0.08)',
                borderRadius: 14, padding: 12,
                boxShadow: '0 8px 28px rgba(0,0,0,0.13)', zIndex: 80,
                width: 192,
              }}
              className="animate-in fade-in slide-in-from-bottom-2 duration-150"
            >
              <div style={{ fontSize: 10.5, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Stickers</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 2 }}>
                {emojis.map(em => (
                  <button
                    key={em}
                    onClick={() => { onInsertEmoji?.(em); setShowEmoji(false); }}
                    style={{ width: 28, height: 28, borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <SEP />

        {/* Draw tools */}
        <button style={toolBtn('pen')} onClick={() => handleTool('pen')} title="Crayon (P)">
          <Pen size={17} />
        </button>

        {/* Pen size buttons (inline when pen active) */}
        {activeTool === 'pen' && penSizes.map(ps => (
          <button
            key={ps.size}
            onClick={() => onBrushThicknessChange(ps.size)}
            title={`Épaisseur ${ps.label}`}
            style={{
              ...TB_BTN_BASE,
              width: 28, height: 36,
              background: brushThickness === ps.size ? 'rgba(99,102,241,0.1)' : 'none',
            }}
          >
            <div style={{
              width: ps.dot, height: ps.dot, borderRadius: '50%',
              background: brushThickness === ps.size ? '#6366F1' : '#9CA3AF',
            }} />
          </button>
        ))}

        <button style={toolBtn('eraser')} onClick={() => handleTool('eraser')} title="Gomme (E)">
          <Eraser size={17} />
        </button>
        <button style={toolBtn('comment')} onClick={() => handleTool('comment')} title="Commentaire">
          <MessageCircle size={17} />
        </button>
        <button style={toolBtn('connect')} onClick={() => handleTool('connect')} title="Connecter (L)">
          <Share2 size={17} />
        </button>

        <SEP />

        {/* Color swatch */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowColors(!showColors); setShowEmoji(false); }}
            title="Couleur"
            style={{ ...TB_BTN_BASE, padding: 6 }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: selectedColor,
              border: '1.5px solid rgba(15,23,42,0.12)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }} />
          </button>
          {showColors && (
            <div
              style={{
                position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%',
                transform: 'translateX(-50%)',
                background: 'white', border: '1px solid rgba(15,23,42,0.08)',
                borderRadius: 12, padding: 12,
                boxShadow: '0 8px 28px rgba(0,0,0,0.12)', zIndex: 60,
                minWidth: 200, display: 'flex', flexDirection: 'column', gap: 10,
              }}
              className="animate-in fade-in slide-in-from-bottom-2 duration-150"
            >
              {COLOR_GROUPS.map(group => (
                <div key={group.label}>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>{group.label}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5 }}>
                    {group.colors.map(c => (
                      <ColorSwatch
                        key={c.hex}
                        color={c.hex}
                        selected={selectedColor === c.hex}
                        label={c.label}
                        onClick={() => { onColorSelect(c.hex); setShowColors(false); }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <SEP />

        {/* Undo / Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          style={{ ...TB_BTN_BASE, opacity: canUndo ? 1 : 0.3 }}
          title="Annuler (⌘Z)"
        >
          <Undo2 size={17} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          style={{ ...TB_BTN_BASE, opacity: canRedo ? 1 : 0.3 }}
          title="Refaire (⌘Y)"
        >
          <Redo2 size={17} />
        </button>

        <SEP />

        {/* Timer */}
        <button
          style={isTimerVisible ? TB_BTN_ACTIVE : TB_BTN_BASE}
          onClick={onToggleTimer}
          title="Timer"
        >
          <Clock size={17} />
        </button>

        {/* Export PNG */}
        <button style={TB_BTN_BASE} onClick={onExportPNG} title="Exporter en PNG">
          <Download size={17} />
        </button>

        {/* Export JSON */}
        <button style={TB_BTN_BASE} onClick={onExportJSON} title="Exporter en JSON">
          <FileJson2 size={17} />
        </button>

        {/* Import JSON */}
        <button style={TB_BTN_BASE} onClick={onImportJSON} title="Importer JSON">
          <Upload size={17} />
        </button>

        {/* Settings / Shortcuts */}
        <button style={TB_BTN_BASE} onClick={onOpenShortcuts} title="Raccourcis clavier">
          <Settings size={17} />
        </button>
      </div>
    </div>
  );
};
