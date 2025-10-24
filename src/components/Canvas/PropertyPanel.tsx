import React, { useState } from "react";
import { Palette, Eye, EyeOff, Lock, Unlock, Copy, Trash2, Tag, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CanvasElement } from "./Canvas";

interface PropertyPanelProps {
  selectedElements: CanvasElement[];
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  isVisible: boolean;
  onToggle: () => void;
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
  onToggle,
}: PropertyPanelProps) => {
  const [panelTab, setPanelTab] = useState<'style' | 'arrange'>('style');
  const [newTag, setNewTag] = useState('');
  const [authorName, setAuthorName] = useState('');
  
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

  const handleUpdateAuthor = () => {
    if (firstElement) {
      onUpdate(firstElement.id, { author: authorName.trim() });
      setAuthorName('');
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="absolute top-20 right-6 z-40 w-10 h-10 bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-float flex items-center justify-center hover:bg-tool-hover transition-colors"
        title="Ouvrir le panneau des propriétés"
      >
        <Eye size={16} />
      </button>
    );
  }

  return (
    <div className="absolute top-20 right-6 z-40 w-80 bg-card/95 backdrop-blur-sm rounded-xl border border-border shadow-float animate-float-in">
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
        <Button variant="ghost" size="sm" onClick={onToggle}>
          <EyeOff size={16} />
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
              {firstElement?.type === 'sticky' && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <User size={14} />
                    Auteur
                  </label>
                  {firstElement.author ? (
                    <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <span className="text-sm">{firstElement.author}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdate(firstElement.id, { author: undefined })}
                        className="h-6"
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateAuthor()}
                        placeholder="Nom de l'auteur..."
                        className="h-8 text-xs flex-1"
                      />
                      <Button onClick={handleUpdateAuthor} size="sm" className="h-8">
                        Définir
                      </Button>
                    </div>
                  )}
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