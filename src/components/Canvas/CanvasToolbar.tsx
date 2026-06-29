import { Type, StickyNote, MousePointer2, Palette, Image, Edit3, Timer, Link2, Eye, Settings, Download, Undo2, Redo2, FileDown, Shapes, MessageCircle, Eraser, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CanvasElement } from "./Canvas";
import { useState } from "react";

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
  onToggleShapeLibrary?: () => void;
  onExportPDF?: () => void;
  onExportSelectedArea?: () => void;
  hasSelection?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onInsertEmoji?: (emoji: string) => void;
}

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Sélection', shortcut: 'V' },
  { id: 'pen', icon: Edit3, label: 'Crayon', shortcut: 'P' },
  { id: 'eraser', icon: Eraser, label: 'Gomme', shortcut: 'E' },
  { id: 'sticky', icon: StickyNote, label: 'Post-it', shortcut: 'S' },
  { id: 'text', icon: Type, label: 'Texte', shortcut: 'T' },
  { id: 'comment', icon: MessageCircle, label: 'Commentaire', shortcut: 'C' },
  { id: 'image', icon: Image, label: 'Image', shortcut: 'I' },
  { id: 'connect', icon: Link2, label: 'Connecter', shortcut: 'L' },
  { id: 'timer', icon: Timer, label: 'Timer', shortcut: 'M' },
  { id: 'view', icon: Eye, label: 'Vue', shortcut: 'W' },
];

const colors = [
  '#FFE066', // Jaune post-it
  '#FF8A80', // Coral doux
  '#81C784', // Vert menthe
  '#64B5F6', // Bleu ciel
  '#FFB74D', // Orange pêche
  '#E1BEE7', // Lavande
  '#A5D6A7', // Vert sauge
  '#F48FB1', // Rose poudré
];

export const CanvasToolbar = ({
  selectedTool,
  selectedColor,
  brushThickness,
  onToolSelect,
  onColorSelect,
  onBrushThicknessChange,
  onAddElement,
  isConnecting,
  onToggleConnecting,
  isTimerVisible,
  onToggleTimer,
  onToggleTextEditor,
  onToggleOptions,
  onToggleShapeLibrary,
  onExportPDF,
  onExportSelectedArea,
  hasSelection = false,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onInsertEmoji,
}: CanvasToolbarProps) => {
  const [showColors, setShowColors] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojis = ['😀','😂','🎉','❤️','👍','🔥','💡','⭐','🎯','✅','🚀','🙏','🎨','🏆','💪','🌟','🤔','😍','🤝','💯','🧠','⚡','🌈','🦄'];
  
  const handleToolClick = (toolId: string) => {
    if (toolId === 'connect') {
      onToggleConnecting();
    } else if (toolId === 'timer') {
      onToggleTimer();
    } else if (toolId === 'text') {
      onToolSelect(toolId);
      onToggleTextEditor();
      onAddElement(toolId as CanvasElement['type']);
    } else {
      onToolSelect(toolId);
      
      // Auto-add element for certain tools (but as pending element)
      if (toolId !== 'select' && toolId !== 'pen' && toolId !== 'eraser' && toolId !== 'connect' && toolId !== 'timer' && toolId !== 'text') {
        onAddElement(toolId as CanvasElement['type']);
      }
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 animate-float-in">
      <div className="floating-element bg-card backdrop-blur-sm rounded-xl border border-border shadow-float p-3">
        <div className="flex items-center gap-3">
          {/* Tools */}
          <div className="flex gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isSelected = selectedTool === tool.id || 
                               (tool.id === 'connect' && isConnecting) ||
                               (tool.id === 'timer' && isTimerVisible);
                
              return (
                <Button
                  key={tool.id}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  className={`
                    w-10 h-10 p-0 tool-button relative group
                    ${isSelected ? 'bg-primary text-primary-foreground shadow-glow' : 'hover:bg-tool-hover'}
                  `}
                  onClick={() => handleToolClick(tool.id)}
                  title={`${tool.label} (${tool.shortcut})`}
                >
                  <Icon size={18} />
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-3 px-2 py-1 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    {tool.label} ({tool.shortcut})
                  </div>
                </Button>
              );
            })}
            
            {/* Shape Library Button */}
            {onToggleShapeLibrary && (
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 tool-button hover:bg-tool-hover relative group"
                onClick={onToggleShapeLibrary}
                title="Formes & Bibliothèque"
              >
                <Shapes size={18} />
                <div className="absolute bottom-full mb-3 px-2 py-1 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  Formes
                </div>
              </Button>
            )}

            {/* Emoji Picker Button */}
            {onInsertEmoji && (
              <div className="relative">
                <Button
                  variant={showEmojiPicker ? "default" : "ghost"}
                  size="sm"
                  className={`w-10 h-10 p-0 tool-button relative group ${showEmojiPicker ? 'bg-primary text-primary-foreground' : 'hover:bg-tool-hover'}`}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Stickers emoji"
                >
                  <Smile size={18} />
                  <div className="absolute bottom-full mb-3 px-2 py-1 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    Emojis
                  </div>
                </Button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl shadow-float p-2 grid grid-cols-6 gap-1 w-44 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    {emojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => { onInsertEmoji(emoji); setShowEmojiPicker(false); }}
                        className="w-6 h-6 text-base flex items-center justify-center rounded hover:bg-muted transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="h-8 w-px bg-border" />

          {/* Color Picker */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowColors(!showColors)}
              className="w-10 h-10 p-0 tool-button hover:bg-tool-hover relative group"
              title="Palette de couleurs"
            >
              <Palette size={18} className={showColors ? "text-primary" : "text-muted-foreground"} />
            </Button>
            
            {showColors && (
              <div className="flex gap-1 animate-in fade-in slide-in-from-left-2 duration-200">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`
                      w-8 h-8 rounded-md border-2 transition-all duration-200 tool-button
                      ${selectedColor === color ? 'border-foreground scale-110 shadow-md' : 'border-border hover:border-muted-foreground'}
                    `}
                    style={{ backgroundColor: color }}
                    onClick={() => onColorSelect(color)}
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Brush Thickness for Pen Tool */}
          {selectedTool === 'pen' && (
            <>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Edit3 size={16} className="text-muted-foreground" />
                <div className="w-24">
                  <Slider
                    value={[brushThickness]}
                    onValueChange={(value) => onBrushThicknessChange(value[0])}
                    min={1}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8">{brushThickness}px</span>
              </div>
            </>
          )}

          {/* Separator */}
          <div className="h-8 w-px bg-border" />

          {/* History Controls */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="w-10 h-10 p-0 text-foreground hover:text-foreground hover:bg-tool-hover transition-all disabled:opacity-30 tool-button"
              title="Annuler (Ctrl+Z)"
            >
              <Undo2 size={20} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="w-10 h-10 p-0 text-foreground hover:text-foreground hover:bg-tool-hover transition-all disabled:opacity-30 tool-button"
              title="Refaire (Ctrl+Y)"
            >
              <Redo2 size={20} />
            </Button>
          </div>

          {/* Separator */}
          <div className="h-8 w-px bg-border" />

          {/* Export and Options */}
          <div className="flex gap-1">
            {onExportPDF && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExportPDF}
                className="w-10 h-10 p-0 text-muted-foreground hover:text-foreground hover:bg-tool-hover transition-colors tool-button"
                title="Exporter tout en PDF"
              >
                <Download size={18} />
              </Button>
            )}
            {onExportSelectedArea && hasSelection && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExportSelectedArea}
                className="w-10 h-10 p-0 text-muted-foreground hover:text-foreground hover:bg-tool-hover transition-colors tool-button"
                title="Exporter la sélection en PDF"
              >
                <FileDown size={18} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleOptions}
              className="w-10 h-10 p-0 text-muted-foreground hover:text-foreground hover:bg-tool-hover transition-colors tool-button"
              title="Options du board"
            >
              <Settings size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};