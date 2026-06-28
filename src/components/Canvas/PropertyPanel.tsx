import React, { useState } from "react";
import { Palette, Copy, Trash2, Tag, User, X, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CanvasElement } from "./Canvas";

interface PropertyPanelProps {
  selectedElements: CanvasElement[];
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  isVisible: boolean;
  onClose: () => void;
  elementPosition?: { x: number; y: number; width: number; height: number };
  canvasTransform: { x: number; y: number; scale: number };
}

const colorOptions = [
  '#FFE066', '#FF8A80', '#81C784', '#64B5F6',
  '#FFB74D', '#E1BEE7', '#A5D6A7', '#F48FB1',
  '#90CAF9', '#FFCC02', '#FF5722', '#4CAF50',
  '#2196F3', '#FF9800', '#9C27B0', '#8BC34A',
];

export const PropertyPanel = ({
  selectedElements,
  onUpdate,
  onDelete,
  onDuplicate,
  isVisible,
  onClose,
  elementPosition,
  canvasTransform,
}: PropertyPanelProps) => {
  const [panelTab, setPanelTab] = useState<'style' | 'arrange'>('style');
  const [newTag, setNewTag] = useState('');
  
  const hasSelection = selectedElements.length > 0;
  const firstElement = selectedElements[0];
  const isMultiSelect = selectedElements.length > 1;

  const handleColorChange = (color: string) => {
    selectedElements.forEach(element => {
      onUpdate(element.id, { color });
    });
  };

  const handleOpacityChange = (opacity: number) => {
    selectedElements.forEach(element => {
      onUpdate(element.id, { opacity });
    });
  };

  const handleFontSizeChange = (fontSize: number) => {
    selectedElements.forEach(element => {
      if (element.type === 'text' || element.type === 'sticky') {
        onUpdate(element.id, { fontSize });
      }
    });
  };

  const handleDeleteSelected = () => {
    selectedElements.forEach(element => {
      onDelete(element.id);
    });
  };

  const handleDuplicateSelected = () => {
    selectedElements.forEach(element => {
      onDuplicate(element.id);
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && firstElement) {
      const currentTags = firstElement.tags || [];
      if (!currentTags.includes(newTag.trim())) {
        onUpdate(firstElement.id, { tags: [...currentTags, newTag.trim()] });
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    if (firstElement) {
      const currentTags = firstElement.tags || [];
      onUpdate(firstElement.id, { tags: currentTags.filter(t => t !== tag) });
    }
  };


  if (!isVisible || !hasSelection) {
    return null;
  }

  // Calculate panel position above the selected element
  const panelWidth = 320;
  const panelHeight = 500; // approximate max height
  const padding = 16;
  
  let panelX = 0;
  let panelY = 0;
  
  if (elementPosition) {
    // Convert element position to screen coordinates
    const screenX = elementPosition.x * canvasTransform.scale + canvasTransform.x;
    const screenY = elementPosition.y * canvasTransform.scale + canvasTransform.y;
    const screenWidth = elementPosition.width * canvasTransform.scale;
    const screenHeight = elementPosition.height * canvasTransform.scale;
    
    // Position panel above the element, centered horizontally
    panelX = screenX + (screenWidth / 2) - (panelWidth / 2);
    panelY = screenY - panelHeight - padding;
    
    // Keep panel within viewport bounds
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (panelX < padding) panelX = padding;
    if (panelX + panelWidth > viewportWidth - padding) {
      panelX = viewportWidth - panelWidth - padding;
    }
    
    // If panel would be above viewport, position it below the element
    if (panelY < padding) {
      panelY = screenY + screenHeight + padding;
    }
    
    // If still doesn't fit, position on the side
    if (panelY + panelHeight > viewportHeight - padding) {
      panelY = screenY;
      panelX = screenX + screenWidth + padding;

      // If doesn't fit on right, try left (clamped so never off-screen)
      if (panelX + panelWidth > viewportWidth - padding) {
        panelX = Math.max(padding, screenX - panelWidth - padding);
      }

      // Clamp vertical so panel stays within viewport
      panelY = Math.max(padding, Math.min(panelY, viewportHeight - panelHeight - padding));
    }
  }

  return (
    <div 
      className="fixed z-[100] w-80 bg-card backdrop-blur-sm rounded-xl border border-border shadow-2xl animate-scale-in"
      style={{
        left: `${panelX}px`,
        top: `${panelY}px`,
        maxHeight: '80vh',
        overflowY: 'auto'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">
          {hasSelection 
            ? isMultiSelect 
              ? `${selectedElements.length} éléments sélectionnés`
              : `${firstElement.type === 'sticky' ? 'Post-it' : firstElement.type === 'text' ? 'Texte' : firstElement.type}`
            : 'Propriétés'
          }
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={16} />
        </Button>
      </div>

      {hasSelection ? (
        <div className="p-4 space-y-4">
          {/* Tabs */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setPanelTab('style')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                panelTab === 'style' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Style
            </button>
            <button
              onClick={() => setPanelTab('arrange')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                panelTab === 'arrange' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Disposition
            </button>
          </div>

          {panelTab === 'style' && (
            <div className="space-y-4">
              {/* Colors */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Couleur</label>
                <div className="grid grid-cols-8 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`w-6 h-6 rounded-md border-2 transition-all hover:scale-110 ${
                        firstElement?.color === color ? 'border-foreground' : 'border-border'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Tags - Only for sticky notes */}
              {firstElement?.type === 'sticky' && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Tag size={14} />
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Nouveau tag..."
                      className="h-8 text-xs flex-1"
                    />
                    <Button onClick={handleAddTag} size="sm" className="h-8">
                      Ajouter
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(firstElement.tags || []).map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-destructive"
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Author - Only for sticky notes */}
              {firstElement?.type === 'sticky' && firstElement.author && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <User size={14} />
                    Auteur
                  </label>
                  <div className="p-2 bg-muted rounded-md">
                    <span className="text-sm">{firstElement.author}</span>
                  </div>
                </div>
              )}

              {/* Font Family for text elements */}
              {(firstElement?.type === 'text' || firstElement?.type === 'sticky') && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Police</label>
                  <Select
                    value={firstElement.fontFamily || 'Arial'}
                    onValueChange={(value) => {
                      selectedElements.forEach(element => {
                        if (element.type === 'text' || element.type === 'sticky') {
                          onUpdate(element.id, { fontFamily: value });
                        }
                      });
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Verdana">Verdana</SelectItem>
                      <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                      <SelectItem value="Impact">Impact</SelectItem>
                      <SelectItem value="Trebuchet MS">Trebuchet MS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Font Size for text elements */}
              {(firstElement?.type === 'text' || firstElement?.type === 'sticky') && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Taille du texte: {firstElement.fontSize || 14}px
                  </label>
                  <Slider
                    value={[firstElement.fontSize || 14]}
                    onValueChange={([value]) => handleFontSizeChange(value)}
                    min={8}
                    max={48}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}

              {/* Text Alignment for text elements */}
              {(firstElement?.type === 'text' || firstElement?.type === 'sticky') && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Alignement</label>
                  <div className="flex gap-2">
                    <Button
                      variant={firstElement.textAlign === 'left' || !firstElement.textAlign ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        selectedElements.forEach(element => {
                          if (element.type === 'text' || element.type === 'sticky') {
                            onUpdate(element.id, { textAlign: 'left' });
                          }
                        });
                      }}
                      className="flex-1"
                    >
                      <AlignLeft size={16} />
                    </Button>
                    <Button
                      variant={firstElement.textAlign === 'center' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        selectedElements.forEach(element => {
                          if (element.type === 'text' || element.type === 'sticky') {
                            onUpdate(element.id, { textAlign: 'center' });
                          }
                        });
                      }}
                      className="flex-1"
                    >
                      <AlignCenter size={16} />
                    </Button>
                    <Button
                      variant={firstElement.textAlign === 'right' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        selectedElements.forEach(element => {
                          if (element.type === 'text' || element.type === 'sticky') {
                            onUpdate(element.id, { textAlign: 'right' });
                          }
                        });
                      }}
                      className="flex-1"
                    >
                      <AlignRight size={16} />
                    </Button>
                  </div>
                </div>
              )}

              {/* Opacity */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Opacité: {Math.round((firstElement?.opacity || 1) * 100)}%
                </label>
                <Slider
                  value={[(firstElement?.opacity || 1) * 100]}
                  onValueChange={([value]) => handleOpacityChange(value / 100)}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {panelTab === 'arrange' && (
            <div className="space-y-4">
              {/* Position */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">X</label>
                  <div className="text-sm font-medium">{Math.round(firstElement.x)}px</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Y</label>
                  <div className="text-sm font-medium">{Math.round(firstElement.y)}px</div>
                </div>
              </div>

              {/* Size */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Largeur</label>
                  <div className="text-sm font-medium">{Math.round(firstElement.width)}px</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Hauteur</label>
                  <div className="text-sm font-medium">{Math.round(firstElement.height)}px</div>
                </div>
              </div>

              {/* Layer Controls */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <span className="text-xs">Avant</span>
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <span className="text-xs">Arrière</span>
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-border space-y-2">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-2"
                onClick={handleDuplicateSelected}
              >
                <Copy size={14} />
                Dupliquer
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-2 text-destructive hover:text-destructive"
                onClick={handleDeleteSelected}
              >
                <Trash2 size={14} />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          <Palette size={32} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">Sélectionnez un élément pour modifier ses propriétés</p>
        </div>
      )}
    </div>
  );
};