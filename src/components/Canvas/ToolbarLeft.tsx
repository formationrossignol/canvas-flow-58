// src/components/Canvas/ToolbarLeft.tsx
import { MousePointer2, Edit3, Eraser, StickyNote, Type, Shapes, Image, MessageCircle, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CanvasElement } from "./Canvas";

interface ToolbarLeftProps {
  selectedTool: string;
  isConnecting: boolean;
  onToolSelect: (tool: string) => void;
  onAddElement: (type: CanvasElement['type']) => void;
  onToggleConnecting: () => void;
  onToggleShapeLibrary: () => void;
}

const modeTools = [
  { id: 'select', icon: MousePointer2, label: 'Sélection', shortcut: 'V' },
  { id: 'pen',    icon: Edit3,         label: 'Crayon',    shortcut: 'P' },
  { id: 'eraser', icon: Eraser,        label: 'Gomme',     shortcut: 'E' },
];

const createTools = [
  { id: 'sticky',  icon: StickyNote,    label: 'Post-it',   shortcut: 'S' },
  { id: 'text',    icon: Type,          label: 'Texte',     shortcut: 'T' },
  { id: 'shapes',  icon: Shapes,        label: 'Formes',    shortcut: 'F' },
  { id: 'image',   icon: Image,         label: 'Image',     shortcut: 'I' },
];

const collabTools = [
  { id: 'comment', icon: MessageCircle, label: 'Commentaire', shortcut: 'C' },
  { id: 'connect', icon: Link2,         label: 'Connecter',   shortcut: 'L' },
];

const NO_ELEMENT_TOOLS = ['select', 'pen', 'eraser', 'connect', 'shapes'];

export const ToolbarLeft = ({
  selectedTool,
  isConnecting,
  onToolSelect,
  onAddElement,
  onToggleConnecting,
  onToggleShapeLibrary,
}: ToolbarLeftProps) => {

  const handleClick = (toolId: string) => {
    if (toolId === 'connect') {
      onToolSelect(toolId);
      onToggleConnecting();
      return;
    }
    if (toolId === 'shapes') {
      onToolSelect(toolId);
      onToggleShapeLibrary();
      return;
    }
    onToolSelect(toolId);
    if (!NO_ELEMENT_TOOLS.includes(toolId)) {
      onAddElement(toolId as CanvasElement['type']);
    }
  };

  const isActive = (toolId: string) =>
    toolId === 'connect' ? isConnecting : selectedTool === toolId;

  const renderGroup = (tools: typeof modeTools) =>
    tools.map(({ id, icon: Icon, label, shortcut }) => (
      <Button
        key={id}
        variant={isActive(id) ? 'default' : 'ghost'}
        size="sm"
        className={`w-9 h-9 p-0 relative group ${
          isActive(id)
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        onClick={() => handleClick(id)}
        title={`${label} (${shortcut})`}
      >
        <Icon size={16} />
        {/* Tooltip */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {label} <span className="opacity-60">({shortcut})</span>
        </div>
      </Button>
    ));

  return (
    <div className="fixed left-3 top-1/2 -translate-y-1/2 z-20">
      <div className="flex flex-col items-center gap-1 bg-card border border-border rounded-2xl shadow-float p-2">
        {renderGroup(modeTools)}
        <div className="w-6 h-px bg-border my-1" />
        {renderGroup(createTools)}
        <div className="w-6 h-px bg-border my-1" />
        {renderGroup(collabTools)}
      </div>
    </div>
  );
};
