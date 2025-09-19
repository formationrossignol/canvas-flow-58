import { Square, Circle, Type, StickyNote, MousePointer2, ArrowRight, Palette, Image, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CanvasElement } from "./Canvas";

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
}

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Sélection', shortcut: 'V' },
  { id: 'pen', icon: Edit3, label: 'Crayon', shortcut: 'P' },
  { id: 'sticky', icon: StickyNote, label: 'Post-it', shortcut: 'S' },
  { id: 'text', icon: Type, label: 'Texte', shortcut: 'T' },
  { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'circle', icon: Circle, label: 'Cercle', shortcut: 'C' },
  { id: 'image', icon: Image, label: 'Image', shortcut: 'I' },
  { id: 'arrow', icon: ArrowRight, label: 'Flèche', shortcut: 'A' },
  { id: 'connect', icon: ArrowRight, label: 'Connecter', shortcut: 'L' },
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
}: CanvasToolbarProps) => {
  const handleToolClick = (toolId: string) => {
    if (toolId === 'connect') {
      onToggleConnecting();
    } else {
      onToolSelect(toolId);
      
      // Auto-add element for certain tools
      if (toolId !== 'select' && toolId !== 'pen' && toolId !== 'connect') {
        onAddElement(toolId as CanvasElement['type']);
      }
    }
  };

  return (
    <div className="absolute top-20 left-6 z-40 animate-float-in">
      <div className="floating-element bg-card/95 backdrop-blur-sm rounded-xl border border-border p-3">
        {/* Tools */}
        <div className="flex flex-col gap-2 mb-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool === tool.id || (tool.id === 'connect' && isConnecting);
            
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
                <div className="absolute left-full ml-3 px-2 py-1 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {tool.label} ({tool.shortcut})
                </div>
              </Button>
            );
          })}
        </div>

        {/* Color Separator */}
        <div className="w-full h-px bg-border mb-3" />

        {/* Color Palette */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <Palette size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Couleurs</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {colors.map((color) => {
              const isSelected = selectedColor === color;
              
              return (
                <button
                  key={color}
                  className={`
                    w-8 h-8 rounded-lg border-2 transition-all duration-200 tool-button
                    ${isSelected ? 'border-foreground shadow-soft' : 'border-border hover:border-muted-foreground'}
                  `}
                  style={{ backgroundColor: color }}
                  onClick={() => onColorSelect(color)}
                  title={`Couleur ${color}`}
                >
                  {isSelected && (
                    <div className="w-full h-full rounded-md flex items-center justify-center">
                      <div className="w-2 h-2 bg-foreground rounded-full" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Brush Thickness for Pen Tool */}
        {selectedTool === 'pen' && (
          <>
            <div className="w-full h-px bg-border my-3" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2">
                <Edit3 size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Épaisseur</span>
              </div>
              <div className="px-1">
                <Slider
                  value={[brushThickness]}
                  onValueChange={(value) => onBrushThicknessChange(value[0])}
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-center text-muted-foreground mt-1">
                  {brushThickness}px
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};