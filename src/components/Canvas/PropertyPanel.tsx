import React, { useState } from "react";
import { Palette, Copy, Trash2, Tag, User, X, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CanvasElement } from "./Canvas";
import { ColorSwatch, TagBadge, PanelHeader, SectionLabel } from "@/components/UI/SharedComponents";
import { STICKY_COLORS, COLORS } from "@/tokens/colors";

interface PropertyPanelProps {
  selectedElements: CanvasElement[];
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

const colorOptions = [
  ...STICKY_COLORS.map(c => c.bg),
  COLORS.neutral[900],
  COLORS.neutral[500],
  '#FFFFFF',
  COLORS.primary[500],
  COLORS.success[500],
  COLORS.danger[500],
  COLORS.warning[500],
  COLORS.accent[500],
];

export const PropertyPanel = ({
  selectedElements,
  onUpdate,
  onDelete,
  onDuplicate,
  isVisible,
  onClose,
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

  return (
    <div
      style={{
        position: 'fixed', right: 20, bottom: 90,
        width: 240, maxHeight: '60vh',
        background: 'white', border: '1px solid rgba(15,23,42,0.07)',
        borderRadius: 14, boxShadow: '0 16px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.05)',
        zIndex: 45, display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <PanelHeader
        title={
          hasSelection
            ? isMultiSelect
              ? `${selectedElements.length} éléments sélectionnés`
              : firstElement.type === 'sticky' ? 'Post-it' : firstElement.type === 'text' ? 'Texte' : firstElement.type
            : 'Propriétés'
        }
        onClose={onClose}
      />

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
                <SectionLabel>Couleur</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5 }}>
                  {colorOptions.map((color) => (
                    <ColorSwatch
                      key={color}
                      color={color}
                      selected={firstElement?.color === color}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Tags - Only for sticky notes */}
              {firstElement?.type === 'sticky' && (
                <div>
                  <SectionLabel><Tag size={12} style={{ display: 'inline', marginRight: 4 }} />Tags</SectionLabel>
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
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(firstElement.tags || []).map((tag) => (
                      <TagBadge
                        key={tag}
                        label={tag}
                        onRemove={() => handleRemoveTag(tag)}
                      />
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