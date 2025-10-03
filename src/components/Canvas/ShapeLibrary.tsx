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
        description: 'Forme rectangulaire classique'
      },
      {
        id: 'circle',
        icon: Circle,
        label: 'Cercle',
        description: 'Forme circulaire parfaite'
      },
      {
        id: 'triangle',
        icon: Triangle,
        label: 'Triangle',
        description: 'Triangle équilatéral'
      },
      {
        id: 'sticky',
        icon: Square,
        label: 'Post-it',
        description: 'Note adhésive'
      },
    ]
  },
  {
    name: "Formes géométriques",
    shapes: [
      {
        id: 'diamond',
        icon: Diamond,
        label: 'Losange',
        description: 'Forme en losange'
      },
      {
        id: 'hexagon',
        icon: Hexagon,
        label: 'Hexagone',
        description: 'Forme à six côtés'
      },
      {
        id: 'pentagon',
        icon: Pentagon,
        label: 'Pentagone',
        description: 'Forme à cinq côtés'
      },
      {
        id: 'octagon' as CanvasElement['type'],
        icon: Octagon,
        label: 'Octogone',
        description: 'Forme à huit côtés'
      },
    ]
  },
  {
    name: "Formes décoratives",
    shapes: [
      {
        id: 'star',
        icon: Star,
        label: 'Étoile',
        description: 'Étoile à cinq branches'
      },
      {
        id: 'heart',
        icon: Heart,
        label: 'Cœur',
        description: 'Forme de cœur'
      },
      {
        id: 'cloud' as CanvasElement['type'],
        icon: CloudRain,
        label: 'Nuage',
        description: 'Forme de nuage'
      },
      {
        id: 'sun' as CanvasElement['type'],
        icon: Sun,
        label: 'Soleil',
        description: 'Forme de soleil'
      },
      {
        id: 'moon' as CanvasElement['type'],
        icon: Moon,
        label: 'Lune',
        description: 'Forme de lune'
      },
      {
        id: 'lightning' as CanvasElement['type'],
        icon: Zap,
        label: 'Éclair',
        description: 'Forme d\'éclair'
      },
    ]
  }
];

export const ShapeLibrary = ({ isVisible, onClose, onAddShape }: ShapeLibraryProps) => {
  if (!isVisible) return null;

  const handleShapeClick = (shapeId: CanvasElement['type']) => {
    onAddShape(shapeId);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-elegant max-w-4xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shapes className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Bibliothèque de formes</h2>
              <p className="text-sm text-muted-foreground">
                Sélectionnez une forme pour l'ajouter au tableau
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
          <div className="p-6 space-y-8">
            {shapeCategories.map((category) => (
              <div key={category.name}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <Badge variant="secondary">{category.shapes.length}</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.shapes.map((shape) => {
                    const Icon = shape.icon;
                    return (
                      <Card
                        key={shape.id}
                        className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all group"
                        onClick={() => handleShapeClick(shape.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <Icon size={24} className="text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{shape.label}</CardTitle>
                              <CardDescription className="text-xs">
                                {shape.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShapeClick(shape.id);
                            }}
                          >
                            Ajouter au tableau
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
