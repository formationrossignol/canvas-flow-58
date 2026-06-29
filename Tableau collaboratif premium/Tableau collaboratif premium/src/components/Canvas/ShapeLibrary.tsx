import { X, Square, Circle, Triangle, Diamond, Star, Heart, Hexagon, Pentagon, Shapes, LucideIcon, Octagon, CloudRain, Sun, Moon, Zap, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CanvasElement } from "./Canvas";

interface ShapeLibraryProps {
  isVisible: boolean;
  onClose: () => void;
  onAddShape: (type: CanvasElement['type']) => void;
}

interface ShapeCategory {
  name: string;
  shapes: Array<{
    id: CanvasElement['type'];
    icon: LucideIcon;
    label: string;
    description: string;
  }>;
}

const shapeCategories: ShapeCategory[] = [
  {
    name: "Formes de base",
    shapes: [
      {
        id: 'rectangle',
        icon: Square,
        label: 'Rectangle',
        description: 'Rectangle classique'
      },
      {
        id: 'circle',
        icon: Circle,
        label: 'Cercle',
        description: 'Cercle parfait'
      },
      {
        id: 'triangle',
        icon: Triangle,
        label: 'Triangle',
        description: 'Triangle'
      },
      {
        id: 'diamond',
        icon: Diamond,
        label: 'Losange',
        description: 'Losange'
      },
      {
        id: 'hexagon',
        icon: Hexagon,
        label: 'Hexagone',
        description: 'Hexagone'
      },
      {
        id: 'pentagon',
        icon: Pentagon,
        label: 'Pentagone',
        description: 'Pentagone'
      },
      {
        id: 'star',
        icon: Star,
        label: 'Étoile',
        description: 'Étoile'
      },
      {
        id: 'heart',
        icon: Heart,
        label: 'Cœur',
        description: 'Cœur'
      },
    ]
  }
];

export const ShapeLibrary = ({ isVisible, onClose, onAddShape }: ShapeLibraryProps) => {
  if (!isVisible) return null;

  const handleShapeClick = (shapeId: CanvasElement['type']) => {
    onAddShape(shapeId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-card backdrop-blur-sm border border-border rounded-xl shadow-float max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shapes className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Formes</h2>
              <p className="text-sm text-muted-foreground">
                Cliquez pour ajouter une forme
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-lg hover:bg-muted"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(80vh-120px)]">
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {shapeCategories[0].shapes.map((shape) => {
                const Icon = shape.icon;
                return (
                  <button
                    key={shape.id}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                    onClick={() => handleShapeClick(shape.id)}
                  >
                    <div className="w-12 h-12 flex items-center justify-center">
                      <Icon size={32} className="text-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-sm font-medium">{shape.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
