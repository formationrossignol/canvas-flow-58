import React, { useState, useRef, useEffect } from "react";
import { X, Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { CanvasElement } from "./Canvas";

interface InlineEditorProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

const fonts = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Courier New', label: 'Courier New' },
];

const colors = [
  '#000000', '#374151', '#6B7280', '#9CA3AF',
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#06B6D4',
  '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6',
  '#A855F7', '#D946EF', '#EC4899', '#F43F5E',
];

export const InlineEditor = ({ element, onUpdate, onClose, position }: InlineEditorProps) => {
  const [content, setContent] = useState(element.content || '');
  const [fontSize, setFontSize] = useState(element.fontSize || 16);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [color, setColor] = useState('#000000');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [opacity, setOpacity] = useState((element.opacity || 1) * 100);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleSave = () => {
    const textDecoration = [
      isUnderline && 'underline',
      isStrikethrough && 'line-through'
    ].filter(Boolean).join(' ') || 'none';

    onUpdate({
      content,
      fontSize,
      opacity: opacity / 100,
      // Store text styles in a way that can be applied
      textStyle: {
        fontFamily,
        color,
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        textDecoration,
        textAlign,
      }
    });
    onClose();
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    if (element.type !== 'text') {
      onUpdate({ color: newColor });
    }
  };

  const showTextControls = element.type === 'text' || element.type === 'sticky';

  return (
    <div 
      className="absolute z-50 bg-card/95 backdrop-blur-sm rounded-xl border border-border shadow-float p-4 min-w-80"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: 'translate(-50%, -100%)',
        marginTop: '-10px'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm flex items-center gap-2">
          <Type size={14} />
          {element.type === 'sticky' ? 'Éditer Post-it' : element.type === 'text' ? 'Éditer Texte' : 'Éditer Élément'}
        </h4>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={14} />
        </Button>
      </div>

      {/* Content Editor */}
      {showTextControls && (
        <div className="space-y-3 mb-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-20 px-3 py-2 text-sm border border-border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Tapez votre texte..."
          />
          
          {/* Font Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fonts.map((font) => (
                  <SelectItem key={font.value} value={font.value} className="text-xs">
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center border border-border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isBold ? 'bg-muted' : ''}`}
                onClick={() => setIsBold(!isBold)}
              >
                <Bold size={12} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isItalic ? 'bg-muted' : ''}`}
                onClick={() => setIsItalic(!isItalic)}
              >
                <Italic size={12} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isUnderline ? 'bg-muted' : ''}`}
                onClick={() => setIsUnderline(!isUnderline)}
              >
                <Underline size={12} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isStrikethrough ? 'bg-muted' : ''}`}
                onClick={() => setIsStrikethrough(!isStrikethrough)}
              >
                <Strikethrough size={12} />
              </Button>
            </div>

            <div className="flex items-center border border-border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${textAlign === 'left' ? 'bg-muted' : ''}`}
                onClick={() => setTextAlign('left')}
              >
                <AlignLeft size={12} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${textAlign === 'center' ? 'bg-muted' : ''}`}
                onClick={() => setTextAlign('center')}
              >
                <AlignCenter size={12} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${textAlign === 'right' ? 'bg-muted' : ''}`}
                onClick={() => setTextAlign('right')}
              >
                <AlignRight size={12} />
              </Button>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Taille: {fontSize}px
            </label>
            <Slider
              value={[fontSize]}
              onValueChange={([value]) => setFontSize(value)}
              min={8}
              max={72}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Color Palette */}
      <div className="space-y-3">
        <label className="text-xs text-muted-foreground block">
          {element.type === 'text' ? 'Couleur du texte' : 'Couleur'}
        </label>
        <div className="grid grid-cols-10 gap-1">
          {colors.map((colorOption) => (
            <button
              key={colorOption}
              onClick={() => handleColorChange(colorOption)}
              className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                color === colorOption ? 'border-foreground' : 'border-border'
              }`}
              style={{ backgroundColor: colorOption }}
            />
          ))}
        </div>
      </div>

      {/* Opacity */}
      <div className="mt-3">
        <label className="text-xs text-muted-foreground mb-1 block">
          Opacité: {opacity}%
        </label>
        <Slider
          value={[opacity]}
          onValueChange={([value]) => setOpacity(value)}
          min={10}
          max={100}
          step={5}
          className="w-full"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-border">
        <Button onClick={handleSave} size="sm" className="flex-1">
          Appliquer
        </Button>
        <Button variant="outline" onClick={onClose} size="sm">
          Annuler
        </Button>
      </div>
    </div>
  );
};