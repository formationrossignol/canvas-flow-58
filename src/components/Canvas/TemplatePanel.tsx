import { useState } from "react";
import { X, Zap, Layout, Plus } from "lucide-react";
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
  {
    id: 'brainstorm',
    name: 'Brainstorming',
    description: 'Session de créativité avec zones d\'idées',
    icon: Lightbulb,
    color: '#FFE066',
    elements: [
      {
        id: 'title-brainstorm',
        type: 'text' as const,
        x: 200,
        y: 100,
        width: 300,
        height: 60,
        color: '#2D3748',
        content: 'Session Brainstorming',
        fontSize: 24,
      },
      {
        id: 'ideas-zone',
        type: 'rectangle' as const,
        x: 150,
        y: 200,
        width: 400,
        height: 300,
        color: '#F7FAFC',
        borderRadius: 12,
      },
      {
        id: 'idea-1',
        type: 'sticky' as const,
        x: 180,
        y: 230,
        width: 120,
        height: 120,
        color: '#FFE066',
        content: 'Idée 1',
      },
      {
        id: 'idea-2',
        type: 'sticky' as const,
        x: 320,
        y: 230,
        width: 120,
        height: 120,
        color: '#81C784',
        content: 'Idée 2',
      },
      {
        id: 'idea-3',
        type: 'sticky' as const,
        x: 180,
        y: 360,
        width: 120,
        height: 120,
        color: '#64B5F6',
        content: 'Idée 3',
      },
      {
        id: 'idea-4',
        type: 'sticky' as const,
        x: 320,
        y: 360,
        width: 120,
        height: 120,
        color: '#FFB74D',
        content: 'Idée 4',
      },
    ],
  },
  {
    id: 'retro',
    name: 'Rétrospective',
    description: 'Analyse d\'équipe avec sections structurées',
    icon: Target,
    color: '#64B5F6',
    elements: [
      {
        id: 'title-retro',
        type: 'text' as const,
        x: 200,
        y: 100,
        width: 400,
        height: 60,
        color: '#2D3748',
        content: 'Rétrospective Sprint',
        fontSize: 24,
      },
      {
        id: 'went-well',
        type: 'rectangle' as const,
        x: 100,
        y: 200,
        width: 180,
        height: 250,
        color: '#C6F6D5',
        borderRadius: 8,
      },
      {
        id: 'went-well-title',
        type: 'text' as const,
        x: 120,
        y: 220,
        width: 140,
        height: 40,
        color: '#2D3748',
        content: '✅ Ce qui a bien marché',
        fontSize: 14,
      },
      {
        id: 'to-improve',
        type: 'rectangle' as const,
        x: 310,
        y: 200,
        width: 180,
        height: 250,
        color: '#FED7D7',
        borderRadius: 8,
      },
      {
        id: 'to-improve-title',
        type: 'text' as const,
        x: 330,
        y: 220,
        width: 140,
        height: 40,
        color: '#2D3748',
        content: '⚠️ À améliorer',
        fontSize: 14,
      },
      {
        id: 'actions',
        type: 'rectangle' as const,
        x: 520,
        y: 200,
        width: 180,
        height: 250,
        color: '#BEE3F8',
        borderRadius: 8,
      },
      {
        id: 'actions-title',
        type: 'text' as const,
        x: 540,
        y: 220,
        width: 140,
        height: 40,
        color: '#2D3748',
        content: '🎯 Actions',
        fontSize: 14,
      },
    ],
  },
  {
    id: 'user-journey',
    name: 'Parcours Utilisateur',
    description: 'Cartographie de l\'expérience utilisateur',
    icon: ArrowRight,
    color: '#E1BEE7',
    elements: [
      {
        id: 'journey-title',
        type: 'text' as const,
        x: 200,
        y: 100,
        width: 400,
        height: 60,
        color: '#2D3748',
        content: 'Parcours Utilisateur',
        fontSize: 24,
      },
      {
        id: 'step-1',
        type: 'circle' as const,
        x: 150,
        y: 200,
        width: 100,
        height: 100,
        color: '#FFE066',
      },
      {
        id: 'step-1-label',
        type: 'text' as const,
        x: 170,
        y: 240,
        width: 60,
        height: 20,
        color: '#2D3748',
        content: 'Étape 1',
        fontSize: 12,
      },
      {
        id: 'arrow-1',
        type: 'arrow' as const,
        x: 260,
        y: 240,
        width: 80,
        height: 20,
        color: '#4A5568',
      },
      {
        id: 'step-2',
        type: 'circle' as const,
        x: 350,
        y: 200,
        width: 100,
        height: 100,
        color: '#81C784',
      },
      {
        id: 'step-2-label',
        type: 'text' as const,
        x: 370,
        y: 240,
        width: 60,
        height: 20,
        color: '#2D3748',
        content: 'Étape 2',
        fontSize: 12,
      },
      {
        id: 'arrow-2',
        type: 'arrow' as const,
        x: 460,
        y: 240,
        width: 80,
        height: 20,
        color: '#4A5568',
      },
      {
        id: 'step-3',
        type: 'circle' as const,
        x: 550,
        y: 200,
        width: 100,
        height: 100,
        color: '#64B5F6',
      },
      {
        id: 'step-3-label',
        type: 'text' as const,
        x: 570,
        y: 240,
        width: 60,
        height: 20,
        color: '#2D3748',
        content: 'Étape 3',
        fontSize: 12,
      },
    ],
  },
  {
    id: 'team-meeting',
    name: 'Réunion d\'Équipe',
    description: 'Structure pour réunions productives',
    icon: Users,
    color: '#FFB74D',
    elements: [
      {
        id: 'meeting-title',
        type: 'text' as const,
        x: 200,
        y: 100,
        width: 400,
        height: 60,
        color: '#2D3748',
        content: 'Réunion d\'Équipe',
        fontSize: 24,
      },
      {
        id: 'agenda',
        type: 'rectangle' as const,
        x: 100,
        y: 200,
        width: 200,
        height: 300,
        color: '#FFF5F5',
        borderRadius: 8,
      },
      {
        id: 'agenda-title',
        type: 'text' as const,
        x: 120,
        y: 220,
        width: 160,
        height: 40,
        color: '#2D3748',
        content: '📋 Ordre du jour',
        fontSize: 16,
      },
      {
        id: 'decisions',
        type: 'rectangle' as const,
        x: 320,
        y: 200,
        width: 200,
        height: 300,
        color: '#F0FFF4',
        borderRadius: 8,
      },
      {
        id: 'decisions-title',
        type: 'text' as const,
        x: 340,
        y: 220,
        width: 160,
        height: 40,
        color: '#2D3748',
        content: '✅ Décisions',
        fontSize: 16,
      },
      {
        id: 'next-steps',
        type: 'rectangle' as const,
        x: 540,
        y: 200,
        width: 200,
        height: 300,
        color: '#F0F9FF',
        borderRadius: 8,
      },
      {
        id: 'next-steps-title',
        type: 'text' as const,
        x: 560,
        y: 220,
        width: 160,
        height: 40,
        color: '#2D3748',
        content: '🎯 Prochaines étapes',
        fontSize: 16,
      },
    ],
  },
];

export const TemplatePanel = ({ isVisible, onClose, onApplyTemplate, currentElements = [] }: TemplatePanelProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [customTemplates, setCustomTemplates] = useState<typeof predefinedTemplates>([]);

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
              {allTemplates.map((template) => {
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};