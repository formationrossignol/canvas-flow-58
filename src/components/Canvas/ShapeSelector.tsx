import { useState } from "react";
import { Square, Circle, Triangle, Diamond, Star, Heart, Hexagon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CanvasElement } from "./Canvas";

const shapes = [
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Cercle' },
  { id: 'triangle', icon: Triangle, label: 'Triangle' },
  { id: 'diamond', icon: Diamond, label: 'Losange' },
  { id: 'star', icon: Star, label: 'Étoile' },
  { id: 'heart', icon: Heart, label: 'Cœur' },
  { id: 'hexagon', icon: Hexagon, label: 'Hexagone' },
];

interface ShapeSelectorProps {
  selectedShape: string;
  onShapeSelect: (shapeType: CanvasElement['type']) => void;
  onAddElement: (type: CanvasElement['type']) => void;
}

export const ShapeSelector = ({ selectedShape, onShapeSelect, onAddElement }: ShapeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentShape = shapes.find(shape => shape.id === selectedShape) || shapes[0];
  const CurrentIcon = currentShape.icon;

  const handleShapeSelect = (shapeId: string) => {
    onShapeSelect(shapeId as CanvasElement['type']);
    onAddElement(shapeId as CanvasElement['type']);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 tool-button hover:bg-tool-hover relative group"
          title={`Formes - ${currentShape.label}`}
        >
          <div className="flex items-center">
            <CurrentIcon size={18} />
            <ChevronDown size={10} className="absolute bottom-0 right-0" />
          </div>
          
          {/* Tooltip */}
          <div className="absolute left-full ml-3 px-2 py-1 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            Formes - {currentShape.label}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" side="right" align="start">
        <div className="grid grid-cols-2 gap-1">
          {shapes.map((shape) => {
            const Icon = shape.icon;
            return (
              <Button
                key={shape.id}
                variant="ghost"
                size="sm"
                className="h-12 flex flex-col items-center gap-1 hover:bg-tool-hover"
                onClick={() => handleShapeSelect(shape.id)}
              >
                <Icon size={18} />
                <span className="text-xs">{shape.label}</span>
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};