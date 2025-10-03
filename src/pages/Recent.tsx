import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Edit, MoreVertical, Star, FileEdit, Download, Share2, Copy, Trash2, Search, LayoutGrid, List, Plus, Layout, Grid as GridIcon, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { templates } from "@/components/Canvas/templates";

type ResourceType = "board" | "template";

interface RecentResource {
  id: string;
  name: string;
  description: string;
  lastOpened: Date;
  elementsCount: number;
  isFavorite?: boolean;
  type: ResourceType;
  tags?: string[];
  category?: string;
}

const Recent = () => {
  const navigate = useNavigate();
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [recentResources, setRecentResources] = useState<RecentResource[]>([
    {
      id: "1",
      name: "Réunion d'équipe Sprint 12",
      description: "Planning et retrospective de l'équipe dev",
      lastOpened: new Date(2024, 0, 15, 14, 30),
      elementsCount: 12,
      isFavorite: true,
      type: "board",
      tags: ["Sprint", "Dev"]
    },
    {
      id: "2",
      name: "Brainstorming Produit",
      description: "Nouvelles fonctionnalités Q1 2024",
      lastOpened: new Date(2024, 0, 15, 10, 15),
      elementsCount: 8,
      isFavorite: false,
      type: "board",
      tags: ["Produit"]
    },
    {
      id: "template-1",
      name: templates[0].name,
      description: templates[0].description,
      lastOpened: new Date(2024, 0, 14, 16, 0),
      elementsCount: templates[0].elements.length,
      isFavorite: false,
      type: "template",
      category: templates[0].category
    },
    {
      id: "template-2",
      name: templates[1].name,
      description: templates[1].description,
      lastOpened: new Date(2024, 0, 13, 9, 0),
      elementsCount: templates[1].elements.length,
      isFavorite: true,
      type: "template",
      category: templates[1].category
    }
  ]);

  // Get all unique tags from resources
  const allTags = Array.from(new Set(
    recentResources.flatMap(r => r.tags || (r.category ? [r.category] : []))
  ));

  const toggleFavorite = (resourceId: string) => {
    setRecentResources(prev =>
      prev.map(resource =>
        resource.id === resourceId
          ? { ...resource, isFavorite: !resource.isFavorite }
          : resource
      )
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const startRenaming = (resourceId: string, currentName: string) => {
    setEditingResourceId(resourceId);
    setEditingName(currentName);
  };

  const handleRenameResource = (resourceId: string) => {
    if (editingName.trim()) {
      setRecentResources(prev =>
        prev.map(resource =>
          resource.id === resourceId ? { ...resource, name: editingName } : resource
        )
      );
      toast.success(recentResources.find(r => r.id === resourceId)?.type === "board" ? "Tableau renommé" : "Template renommé");
    }
    setEditingResourceId(null);
    setEditingName("");
  };

  const handleDuplicateResource = (resourceId: string) => {
    const resource = recentResources.find(r => r.id === resourceId);
    if (resource) {
      const newResource = {
        ...resource,
        id: `${resource.type}-${Date.now()}`,
        name: `${resource.name} (copie)`,
        lastOpened: new Date()
      };
      setRecentResources(prev => [...prev, newResource]);
      toast.success(resource.type === "board" ? "Tableau dupliqué" : "Template dupliqué");
    }
  };

  const handleExportResource = (resource: RecentResource) => {
    const dataStr = JSON.stringify(resource, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${resource.name || 'resource'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success(resource.type === "board" ? "Tableau exporté" : "Template exporté");
  };

  const handleShareResource = (resourceId: string) => {
    const resource = recentResources.find(r => r.id === resourceId);
    const shareUrl = resource?.type === "board" 
      ? `${window.location.origin}/canvas/${resourceId}`
      : `${window.location.origin}/templates`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Lien copié dans le presse-papiers!");
  };

  const confirmDeleteResource = () => {
    if (resourceToDelete) {
      const resource = recentResources.find(r => r.id === resourceToDelete);
      setRecentResources(prev => prev.filter(r => r.id !== resourceToDelete));
      toast.success(resource?.type === "board" ? "Tableau supprimé" : "Template supprimé");
      setResourceToDelete(null);
    }
  };

  const handleOpenResource = (resource: RecentResource) => {
    if (resource.type === "board") {
      navigate(`/canvas/${resource.id}`);
    } else {
      // For templates, create a new board with template
      const boardId = `board-${Date.now()}`;
      navigate(`/canvas/${boardId}?template=${resource.id}`);
    }
  };

  const filteredResources = recentResources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || resource.type === selectedType;
    const resourceTags = resource.tags || (resource.category ? [resource.category] : []);
    const matchesTags = selectedTags.length === 0 || 
      resourceTags.some(tag => selectedTags.includes(tag));
    return matchesSearch && matchesType && matchesTags;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">Ressources Récentes</h2>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher une ressource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="board">Tableaux</SelectItem>
              <SelectItem value="template">Templates</SelectItem>
            </SelectContent>
          </Select>
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
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-muted-foreground">Filtrer par tags:</span>
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTags([])}
                className="h-6 px-2"
              >
                Réinitialiser
              </Button>
            )}
          </div>
        )}
      </div>

      {filteredResources.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune ressource récente</h3>
            <p className="text-muted-foreground">
              Les tableaux et templates que vous ouvrez apparaîtront ici
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                  {(resource.tags || resource.category) && (
                    <div className="px-4 pt-4 flex flex-wrap gap-2">
                      {(resource.tags || [resource.category]).filter(Boolean).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={resource.type === "board" ? "teal" : "purple"} className="text-xs">
                            {resource.type === "board" ? "Tableau" : "Template"}
                          </Badge>
                        </div>
                        {editingResourceId === resource.id ? (
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameResource(resource.id);
                              if (e.key === 'Escape') {
                                setEditingResourceId(null);
                                setEditingName("");
                              }
                            }}
                            onBlur={() => handleRenameResource(resource.id)}
                            autoFocus
                            className="h-7 text-lg font-semibold mb-1"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg line-clamp-1 flex-1">{resource.name}</CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(resource.id);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Star className={`h-4 w-4 ${resource.isFavorite ? 'fill-current text-yellow-500' : ''}`} />
                            </Button>
                          </div>
                        )}
                        <CardDescription className="line-clamp-2 mt-1">
                          {resource.description}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 w-8 p-0 ml-2"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            startRenaming(resource.id, resource.name);
                          }}>
                            <FileEdit className="h-4 w-4 mr-2" />
                            Renommer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateResource(resource.id);
                          }}>
                            <Copy className="h-4 w-4 mr-2" />
                            Dupliquer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleExportResource(resource);
                          }}>
                            <Download className="h-4 w-4 mr-2" />
                            Exporter
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleShareResource(resource.id);
                          }}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Partager
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              setResourceToDelete(resource.id);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>{resource.elementsCount} éléments</span>
                      <span>Il y a {Math.floor((Date.now() - resource.lastOpened.getTime()) / (1000 * 60))} min</span>
                    </div>
                    <Button 
                      onClick={() => handleOpenResource(resource)} 
                      className="w-full gap-2"
                    >
                      {resource.type === "board" ? (
                        <>
                          <Edit className="h-4 w-4" />
                          Ouvrir
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Utiliser
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-3 flex-1">
                          <Badge variant={resource.type === "board" ? "teal" : "purple"}>
                            {resource.type === "board" ? <GridIcon className="h-3 w-3" /> : <Layout className="h-3 w-3" />}
                          </Badge>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {editingResourceId === resource.id ? (
                                <Input
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRenameResource(resource.id);
                                    if (e.key === 'Escape') {
                                      setEditingResourceId(null);
                                      setEditingName("");
                                    }
                                  }}
                                  onBlur={() => handleRenameResource(resource.id)}
                                  autoFocus
                                  className="h-7 font-semibold max-w-xs"
                                />
                              ) : (
                                <>
                                  <h3 className="font-semibold">{resource.name}</h3>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(resource.id);
                                    }}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Star className={`h-4 w-4 ${resource.isFavorite ? 'fill-current text-yellow-500' : ''}`} />
                                  </Button>
                                </>
                              )}
                              {(resource.tags || [resource.category]).filter(Boolean).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">{resource.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span>{resource.elementsCount} éléments</span>
                              <span>Il y a {Math.floor((Date.now() - resource.lastOpened.getTime()) / (1000 * 60))} min</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => handleOpenResource(resource)}
                          size="sm"
                          className="gap-2"
                        >
                          {resource.type === "board" ? (
                            <>
                              <Edit className="h-4 w-4" />
                              Ouvrir
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                              Utiliser
                            </>
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              startRenaming(resource.id, resource.name);
                            }}>
                              <FileEdit className="h-4 w-4 mr-2" />
                              Renommer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateResource(resource.id);
                            }}>
                              <Copy className="h-4 w-4 mr-2" />
                              Dupliquer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleExportResource(resource);
                            }}>
                              <Download className="h-4 w-4 mr-2" />
                              Exporter
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleShareResource(resource.id);
                            }}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Partager
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                setResourceToDelete(resource.id);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <AlertDialog open={resourceToDelete !== null} onOpenChange={(open) => !open && setResourceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette ressource ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteResource} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Recent;