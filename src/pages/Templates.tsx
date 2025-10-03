import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layout, Plus, Search, FileEdit, LayoutGrid, List, Star, X, Upload } from "lucide-react";
import { templates } from "@/components/Canvas/templates";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Templates = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    tags: [] as string[],
    imageUrl: "",
    headerFile: null as File | null
  });
  const [tagInput, setTagInput] = useState("");

  // Get all unique tags/categories from templates
  const allTags = Array.from(new Set(templates.map(t => t.category)));

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.includes(template.category);
    return matchesSearch && matchesTags;
  });

  const toggleFavorite = (templateId: string) => {
    setFavoriteTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newTemplate.tags.includes(tagInput.trim())) {
      setNewTemplate(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewTemplate(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewTemplate(prev => ({
          ...prev,
          imageUrl: event.target?.result as string,
          headerFile: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim()) {
      toast.error("Le nom du template est requis");
      return;
    }
    
    // Here you would save the template
    toast.success("Template créé avec succès!");
    setIsCreateDialogOpen(false);
    setNewTemplate({
      name: "",
      description: "",
      tags: [],
      imageUrl: "",
      headerFile: null
    });
  };

  const handleUseTemplate = (templateId: string) => {
    const boardId = `board-${Date.now()}`;
    navigate(`/canvas/${boardId}?template=${templateId}`);
  };

  return (
    <ScrollArea className="h-screen">
      <div className="p-8">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau template</DialogTitle>
              <DialogDescription>
                Définissez les propriétés de votre template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template-image">Image header</Label>
                <div className="flex flex-col gap-2">
                  {newTemplate.imageUrl && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden">
                      <img 
                        src={newTemplate.imageUrl} 
                        alt="Header preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <Input
                    id="template-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-name">Nom du template *</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Template Agile Sprint"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez l'objectif de ce template..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Ajouter un tag..."
                  />
                  <Button type="button" onClick={handleAddTag} size="sm">
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newTemplate.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false);
                setNewTemplate({
                  name: "",
                  description: "",
                  tags: [],
                  imageUrl: "",
                  headerFile: null
                });
              }}>
                Annuler
              </Button>
              <Button onClick={handleCreateTemplate}>
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Layout className="h-6 w-6" />
            <h2 className="text-2xl font-semibold">Templates</h2>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <FileEdit className="h-4 w-4" />
            Créer un template
          </Button>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un template..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {allTags.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            return (
              <Card key={template.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                {template.imageUrl && (
                  <div className="h-32 overflow-hidden">
                    <img 
                      src={template.imageUrl} 
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex gap-2 items-center">
                      <Badge variant="secondary">
                        {template.category}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(template.id);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Star className={`h-4 w-4 ${favoriteTemplates.includes(template.id) ? 'fill-current text-yellow-500' : ''}`} />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-3">
                    {template.elements.length} éléments
                  </div>
                  <Button 
                    onClick={() => handleUseTemplate(template.id)} 
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Utiliser ce template
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTemplates.map((template) => {
            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {template.imageUrl && (
                        <div className="h-16 w-24 rounded-lg overflow-hidden shrink-0">
                          <img 
                            src={template.imageUrl} 
                            alt={template.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(template.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Star className={`h-4 w-4 ${favoriteTemplates.includes(template.id) ? 'fill-current text-yellow-500' : ''}`} />
                        </Button>
                      </div>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{template.elements.length} éléments</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleUseTemplate(template.id)}
                      size="sm"
                      className="ml-4 gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Utiliser
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredTemplates.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun template trouvé</h3>
            <p className="text-muted-foreground">
              Essayez avec d'autres mots-clés
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </ScrollArea>
  );
};

export default Templates;
