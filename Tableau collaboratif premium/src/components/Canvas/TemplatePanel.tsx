import { useState } from "react";
import { X, Zap, Layout, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CanvasElement } from "./Canvas";
import { templates as predefinedTemplates } from "./templates";

interface TemplatePanelProps {
  isVisible: boolean;
  onClose: () => void;
  onApplyTemplate: (elements: CanvasElement[]) => void;
  currentElements?: CanvasElement[];
}

export const TemplatePanel = ({ isVisible, onClose, onApplyTemplate, currentElements = [] }: TemplatePanelProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [customTemplates, setCustomTemplates] = useState<typeof predefinedTemplates>([]);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isVisible) return null;

  const handleApplyTemplate = (template: typeof predefinedTemplates[0]) => {
    onApplyTemplate(template.elements);
    onClose();
  };

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim() || currentElements.length === 0) return;
    
    const newTemplate = {
      id: `custom-${Date.now()}`,
      name: newTemplateName,
      description: newTemplateDescription || 'Template personnalisé',
      icon: Layout,
      color: '#6366F1',
      category: 'Personnalisé',
      elements: currentElements.map(el => ({ ...el, id: `${el.type}-${Date.now()}-${Math.random()}` })) as any,
    };
    
    setCustomTemplates(prev => [...prev, newTemplate] as any);
    setIsCreating(false);
    setNewTemplateName('');
    setNewTemplateDescription('');
  };

  const allTemplates = [...predefinedTemplates, ...customTemplates];
  
  const filteredTemplates = allTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="absolute right-0 top-0 h-full w-96 bg-card border-l border-border shadow-float animate-slide-in-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Layout size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Templates</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un template..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Create Template Section */}
          {currentElements.length > 0 && (
            <div className="p-6 border-b border-border">
              {!isCreating ? (
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => setIsCreating(true)}
                >
                  <Plus size={16} />
                  Créer un template à partir du canvas actuel
                </Button>
              ) : (
                <div className="space-y-3">
                  <Input
                    placeholder="Nom du template"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                  />
                  <Textarea
                    placeholder="Description (optionnel)"
                    value={newTemplateDescription}
                    onChange={(e) => setNewTemplateDescription(e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleCreateTemplate} disabled={!newTemplateName.trim()}>
                      Créer
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsCreating(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Templates Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {filteredTemplates.map((template) => {
                const Icon = template.icon;
                const isSelected = selectedTemplate === template.id;
                
                return (
                  <div
                    key={template.id}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
                      ${isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-muted-foreground bg-background'
                      }
                    `}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: template.color }}
                      >
                        <Icon size={20} className="text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground">{template.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {template.elements.length} éléments
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyTemplate(template);
                          }}
                          className="w-full"
                        >
                          <Zap size={16} className="mr-2" />
                          Appliquer ce template
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {filteredTemplates.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun template trouvé</h3>
                  <p className="text-muted-foreground">
                    Essayez avec d'autres mots-clés
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};