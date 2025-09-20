import { useState } from "react";
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TextStyle {
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
}

interface TextEditorProps {
  style: TextStyle;
  onStyleChange: (style: TextStyle) => void;
  isVisible: boolean;
}

const fonts = [
  { value: 'Inter', label: 'Inter (Default)' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
];

const colors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#000080',
  '#808080', '#C0C0C0', '#800000', '#808000'
];

export const TextEditor = ({ style, onStyleChange, isVisible }: TextEditorProps) => {
  if (!isVisible) return null;

  const handleFontChange = (fontFamily: string) => {
    onStyleChange({ ...style, fontFamily });
  };

  const toggleBold = () => {
    const isBold = style.fontWeight === 'bold';
    onStyleChange({ ...style, fontWeight: isBold ? 'normal' : 'bold' });
  };

  const toggleItalic = () => {
    const isItalic = style.fontStyle === 'italic';
    onStyleChange({ ...style, fontStyle: isItalic ? 'normal' : 'italic' });
  };

  const toggleUnderline = () => {
    const hasUnderline = style.textDecoration?.includes('underline');
    let newDecoration = style.textDecoration || '';
    
    if (hasUnderline) {
      newDecoration = newDecoration.replace('underline', '').trim();
    } else {
      newDecoration = newDecoration ? `${newDecoration} underline` : 'underline';
    }
    
    onStyleChange({ ...style, textDecoration: newDecoration || 'none' });
  };

  const toggleStrikethrough = () => {
    const hasStrikethrough = style.textDecoration?.includes('line-through');
    let newDecoration = style.textDecoration || '';
    
    if (hasStrikethrough) {
      newDecoration = newDecoration.replace('line-through', '').trim();
    } else {
      newDecoration = newDecoration ? `${newDecoration} line-through` : 'line-through';
    }
    
    onStyleChange({ ...style, textDecoration: newDecoration || 'none' });
  };

  const setAlignment = (align: 'left' | 'center' | 'right') => {
    onStyleChange({ ...style, textAlign: align });
  };

  const setColor = (color: string) => {
    onStyleChange({ ...style, color });
  };

  return (
    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 bg-card/95 backdrop-blur-sm rounded-xl border border-border p-4 shadow-float animate-float-in">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-sm font-medium text-foreground">Format du texte</h4>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        {/* Font Family */}
        <Select value={style.fontFamily || 'Inter'} onValueChange={handleFontChange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Police" />
          </SelectTrigger>
          <SelectContent>
            {fonts.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Text Style Buttons */}
        <div className="flex items-center gap-1 border-l border-border pl-2">
          <Button
            variant={style.fontWeight === 'bold' ? 'default' : 'ghost'}
            size="sm"
            onClick={toggleBold}
            className="w-8 h-8 p-0"
          >
            <Bold size={14} />
          </Button>
          
          <Button
            variant={style.fontStyle === 'italic' ? 'default' : 'ghost'}
            size="sm"
            onClick={toggleItalic}
            className="w-8 h-8 p-0"
          >
            <Italic size={14} />
          </Button>
          
          <Button
            variant={style.textDecoration?.includes('underline') ? 'default' : 'ghost'}
            size="sm"
            onClick={toggleUnderline}
            className="w-8 h-8 p-0"
          >
            <Underline size={14} />
          </Button>
          
          <Button
            variant={style.textDecoration?.includes('line-through') ? 'default' : 'ghost'}
            size="sm"
            onClick={toggleStrikethrough}
            className="w-8 h-8 p-0"
          >
            <Strikethrough size={14} />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-l border-border pl-2">
          <Button
            variant={style.textAlign === 'left' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setAlignment('left')}
            className="w-8 h-8 p-0"
          >
            <AlignLeft size={14} />
          </Button>
          
          <Button
            variant={style.textAlign === 'center' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setAlignment('center')}
            className="w-8 h-8 p-0"
          >
            <AlignCenter size={14} />
          </Button>
          
          <Button
            variant={style.textAlign === 'right' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setAlignment('right')}
            className="w-8 h-8 p-0"
          >
            <AlignRight size={14} />
          </Button>
        </div>

        {/* Color Picker */}
        <div className="border-l border-border pl-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                <div className="flex items-center">
                  <Palette size={14} />
                  <div 
                    className="w-2 h-2 rounded-full ml-1"
                    style={{ backgroundColor: style.color || '#000000' }}
                  />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3">
              <div className="grid grid-cols-8 gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setColor(color)}
                    className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                      style.color === color ? 'border-foreground' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};