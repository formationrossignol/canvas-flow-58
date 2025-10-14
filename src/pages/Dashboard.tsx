import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  Plus,
  Grid,
  Trash2,
  Edit,
  Copy,
  Search,
  Download,
  LayoutGrid,
  List,
  Star,
  Share2,
  FileEdit,
  MoreVertical,
  Folder,
  X,
  Settings,
  UserCog,
  Users,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Toggle } from "@/components/ui/toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { EditBoardDialog, EditBoardData } from "@/components/EditBoardDialog";

interface SavedBoard {
  id: string;
  name: string;
  description: string;
  lastModified: Date;
  elementsCount: number;
  thumbnail?: string;
  isFavorite?: boolean;
  teamId?: string;
  tags?: string[];
}

// Dashboard component for managing boards
const Dashboard = () => {
  const navigate = useNavigate();
  const [savedBoards, setSavedBoards] = useState<SavedBoard[]>([
    {
      id: "1",
      name: "Réunion d'équipe Sprint 12",
      description: "Planning et retrospective de l'équipe dev",
      lastModified: new Date(2024, 0, 15),
      elementsCount: 12,
      isFavorite: true,
      teamId: "team2",
      tags: ["Sprint", "Dev"]
    },
    {
      id: "2", 
      name: "Brainstorming Produit",
      description: "Nouvelles fonctionnalités Q1 2024",
      lastModified: new Date(2024, 0, 10),
      elementsCount: 8,
      isFavorite: false,
      teamId: "team1",
      tags: ["Produit", "Q1"]
    }
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [renamingBoardId, setRenamingBoardId] = useState<string | null>(null);
  const [newBoardName, setNewBoardName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDiagramDialogOpen, setIsDiagramDialogOpen] = useState(false);
  const [newBoard, setNewBoard] = useState({
    name: "",
    description: "",
    teamId: "team1",
    tags: [] as string[],
    headerImage: ""
  });
  const [tagInput, setTagInput] = useState("");
  const [selectedBoardTags, setSelectedBoardTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  
  const teams = [
    { id: "all", name: "Tous les tableaux" },
    { id: "team1", name: "Équipe Marketing" },
    { id: "team2", name: "Équipe Dev" },
    { id: "team3", name: "Projets Perso" }
  ];

  // Get all unique tags from boards
  const allBoardTags = Array.from(new Set(savedBoards.flatMap(b => b.tags || [])));

  const handleCreateNewBoard = () => {
    setIsCreateDialogOpen(true);
  };

  const handleConfirmCreateBoard = () => {
    if (!newBoard.name.trim()) {
      toast.error("Le nom du tableau est requis");
      return;
    }

    const board: SavedBoard = {
      id: `board-${Date.now()}`,
      name: newBoard.name,
      description: newBoard.description,
      lastModified: new Date(),
      elementsCount: 0,
      isFavorite: false,
      teamId: newBoard.teamId,
      tags: newBoard.tags
    };

    setSavedBoards(prev => [...prev, board]);
    toast.success("Tableau créé");
    setIsCreateDialogOpen(false);
    setNewBoard({ name: "", description: "", teamId: "team1", tags: [], headerImage: "" });
    navigate(`/canvas/${board.id}`);
  };

  const handleCreateDiagram = () => {
    if (!newBoard.name.trim()) {
      toast.error("Le nom du diagramme est requis");
      return;
    }

    const board: SavedBoard = {
      id: `diagram-${Date.now()}`,
      name: newBoard.name,
      description: newBoard.description,
      lastModified: new Date(),
      elementsCount: 0,
      isFavorite: false,
      teamId: newBoard.teamId,
      tags: [...newBoard.tags, "Diagramme"]
    };

    setSavedBoards(prev => [...prev, board]);
    toast.success("Diagramme créé");
    setIsDiagramDialogOpen(false);
    setNewBoard({ name: "", description: "", teamId: "team1", tags: [], headerImage: "" });
    navigate(`/canvas/${board.id}`);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newBoard.tags.includes(tagInput.trim())) {
      setNewBoard(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewBoard(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const toggleBoardTag = (tag: string) => {
    setSelectedBoardTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleOpenBoard = (boardId: string) => {
    navigate(`/canvas/${boardId}`);
  };

  const confirmDeleteBoard = () => {
    if (boardToDelete) {
      setSavedBoards(prev => prev.filter(board => board.id !== boardToDelete));
      toast.success("Tableau supprimé");
      setBoardToDelete(null);
    }
  };

  const handleDuplicateBoard = (board: SavedBoard) => {
    const newBoard: SavedBoard = {
      ...board,
      id: `board-${Date.now()}`,
      name: `${board.name} (copie)`,
      lastModified: new Date(),
    };
    setSavedBoards(prev => [...prev, newBoard]);
    toast.success("Tableau dupliqué");
  };

  const toggleFavorite = (boardId: string) => {
    setSavedBoards(prev =>
      prev.map(board =>
        board.id === boardId
          ? { ...board, isFavorite: !board.isFavorite }
          : board
      )
    );
  };

  const handleRenameBoard = (id: string, newName: string) => {
    const updatedBoards = savedBoards.map(board =>
      board.id === id ? { ...board, name: newName } : board
    );
    setSavedBoards(updatedBoards);
    setRenamingBoardId(null);
    setNewBoardName("");
    toast.success("Tableau renommé");
  };

  const handleExportBoard = (board: SavedBoard) => {
    const dataStr = JSON.stringify(board, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${board.name || 'tableau'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success("Tableau exporté");
  };

  const handleShareBoard = (board: SavedBoard) => {
    const shareUrl = `${window.location.origin}/canvas/${board.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Lien copié dans le presse-papiers!");
  };

  const handleEditBoard = (boardId: string, data: EditBoardData) => {
    setSavedBoards(prev =>
      prev.map(board =>
        board.id === boardId
          ? { ...board, ...data }
          : board
      )
    );
    toast.success("Tableau modifié avec succès");
  };

  const filteredBoards = savedBoards.filter(board => {
    const matchesSearch = board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !showFavoritesOnly || board.isFavorite;
    const matchesTeam = selectedTeam === "all" || board.teamId === selectedTeam;
    const matchesTags = selectedBoardTags.length === 0 || 
      (board.tags && board.tags.some(tag => selectedBoardTags.includes(tag)));
    return matchesSearch && matchesFavorite && matchesTeam && matchesTags;
  });

  const totalPages = Math.ceil(filteredBoards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBoards = filteredBoards.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-8">
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau tableau</DialogTitle>
            <DialogDescription>
              Définissez les propriétés de votre nouveau tableau
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="board-name">Nom du tableau *</Label>
              <Input
                id="board-name"
                value={newBoard.name}
                onChange={(e) => setNewBoard(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Réunion d'équipe Sprint 13"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="board-description">Description</Label>
              <Textarea
                id="board-description"
                value={newBoard.description}
                onChange={(e) => setNewBoard(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez le contenu de ce tableau..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="board-team">Équipe</Label>
              <Select value={newBoard.teamId} onValueChange={(value) => setNewBoard(prev => ({ ...prev, teamId: value }))}>
                <SelectTrigger id="board-team">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teams.filter(t => t.id !== "all").map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {newBoard.tags.map(tag => (
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
              setNewBoard({ name: "", description: "", teamId: "team1", tags: [], headerImage: "" });
            }}>
              Annuler
            </Button>
            <Button onClick={handleConfirmCreateBoard}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Mes tableaux</h2>
        <div className="flex gap-2">
          <Button onClick={handleCreateNewBoard} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau tableau
          </Button>
          <Button onClick={() => setIsDiagramDialogOpen(true)} variant="outline" className="gap-2">
            <FileEdit className="h-4 w-4" />
            Créer un diagramme
          </Button>
        </div>
      </div>

      {/* Diagram Dialog */}
      <Dialog open={isDiagramDialogOpen} onOpenChange={setIsDiagramDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau diagramme</DialogTitle>
            <DialogDescription>
              Définissez les propriétés de votre nouveau diagramme
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="diagram-name">Nom du diagramme *</Label>
              <Input
                id="diagram-name"
                value={newBoard.name}
                onChange={(e) => setNewBoard(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Architecture système"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diagram-description">Description</Label>
              <Textarea
                id="diagram-description"
                value={newBoard.description}
                onChange={(e) => setNewBoard(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez le contenu de ce diagramme..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diagram-team">Équipe</Label>
              <Select value={newBoard.teamId} onValueChange={(value) => setNewBoard(prev => ({ ...prev, teamId: value }))}>
                <SelectTrigger id="diagram-team">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teams.filter(t => t.id !== "all").map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {newBoard.tags.map(tag => (
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
              setIsDiagramDialogOpen(false);
              setNewBoard({ name: "", description: "", teamId: "team1", tags: [], headerImage: "" });
            }}>
              Annuler
            </Button>
            <Button onClick={handleCreateDiagram}>
              Créer le diagramme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 mb-8 md:grid-cols-2 xl:grid-cols-3">
        <Card className="border-2 border-dashed border-primary/40 bg-primary/5">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div className="space-y-1">
              <CardTitle className="text-lg">Gestion des profils</CardTitle>
              <CardDescription>
                Retrouvez le module complet pour attribuer les rôles, squads et accès de vos collaborateurs.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="uppercase tracking-wide">
              Nouveau
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Centralisez vos utilisateurs, ajustez leurs responsabilités et gardez une vision claire des équipes agiles.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate("/users")} className="gap-2">
                <UserCog className="h-4 w-4" />
                Ouvrir la gestion des utilisateurs
              </Button>
              <Button variant="ghost" onClick={() => navigate("/teams")} className="gap-2">
                <Users className="h-4 w-4" />
                Ajuster les équipes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar and View Controls */}
      {savedBoards.length > 0 && (
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher un tableau..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-[200px]">
              <div className="flex items-center">
                <Folder className="h-4 w-4 mr-2" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {teams.map(team => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Toggle
              pressed={showFavoritesOnly}
              onPressedChange={setShowFavoritesOnly}
              aria-label="Afficher favoris uniquement"
              className="gap-2"
            >
              <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              Favoris
            </Toggle>
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
          </div>
          {allBoardTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground">Filtrer par tags:</span>
              {allBoardTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedBoardTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleBoardTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
              {selectedBoardTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBoardTags([])}
                  className="h-6 px-2"
                >
                  Réinitialiser
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {savedBoards.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Grid className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun tableau</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre premier tableau collaboratif
            </p>
            <Button onClick={handleCreateNewBoard} className="gap-2">
              <Plus className="h-4 w-4" />
              Créer un tableau
            </Button>
          </CardContent>
        </Card>
      ) : filteredBoards.length === 0 && showFavoritesOnly ? (
        <Card className="text-center py-12">
          <CardContent>
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun favori</h3>
            <p className="text-muted-foreground">
              Vous n'avez pas encore de tableaux favoris
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedBoards.map((board) => (
                <Card key={board.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  {board.tags && board.tags.length > 0 && (
                    <div className="px-4 pt-4 flex flex-wrap gap-2">
                      {board.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        {renamingBoardId === board.id ? (
                          <Input
                            value={newBoardName}
                            onChange={(e) => setNewBoardName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameBoard(board.id, newBoardName);
                              if (e.key === 'Escape') {
                                setRenamingBoardId(null);
                                setNewBoardName("");
                              }
                            }}
                            onBlur={() => {
                              if (newBoardName.trim()) handleRenameBoard(board.id, newBoardName);
                              else {
                                setRenamingBoardId(null);
                                setNewBoardName("");
                              }
                            }}
                            autoFocus
                            className="h-7 text-lg font-semibold"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg line-clamp-1 flex-1">{board.name}</CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(board.id);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Star className={`h-4 w-4 ${board.isFavorite ? 'fill-current text-yellow-500' : ''}`} />
                            </Button>
                          </div>
                        )}
                        <CardDescription className="line-clamp-2 mt-1">
                          {board.description}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setEditingBoardId(board.id);
                          }}>
                            <Settings className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateBoard(board);
                          }}>
                            <Copy className="h-4 w-4 mr-2" />
                            Dupliquer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Affecter à une équipe
                          </DropdownMenuLabel>
                          {teams.filter(t => t.id !== "all").map(team => (
                            <DropdownMenuItem 
                              key={team.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSavedBoards(prev => 
                                  prev.map(b => b.id === board.id ? { ...b, teamId: team.id } : b)
                                );
                                toast.success(`Tableau affecté à ${team.name}`);
                              }}
                            >
                              <Folder className={`h-4 w-4 mr-2 ${board.teamId === team.id ? 'fill-current' : ''}`} />
                              {team.name}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleExportBoard(board);
                          }}>
                            <Download className="h-4 w-4 mr-2" />
                            Exporter
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleShareBoard(board);
                          }}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Partager
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              setBoardToDelete(board.id);
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
                      <span>{board.elementsCount} éléments</span>
                      <span>Modifié le {board.lastModified.toLocaleDateString()}</span>
                    </div>
                    <Button 
                      onClick={() => handleOpenBoard(board.id)} 
                      className="w-full gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Ouvrir
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedBoards.map((board) => (
                <Card key={board.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(board.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Star className={`h-4 w-4 ${board.isFavorite ? 'fill-current text-yellow-500' : ''}`} />
                        </Button>
                        <div className="flex-1">
                          {renamingBoardId === board.id ? (
                            <Input
                              value={newBoardName}
                              onChange={(e) => setNewBoardName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameBoard(board.id, newBoardName);
                                if (e.key === 'Escape') {
                                  setRenamingBoardId(null);
                                  setNewBoardName("");
                                }
                              }}
                              onBlur={() => {
                                if (newBoardName.trim()) handleRenameBoard(board.id, newBoardName);
                                else {
                                  setRenamingBoardId(null);
                                  setNewBoardName("");
                                }
                              }}
                              autoFocus
                              className="h-7 font-semibold"
                            />
                          ) : (
                            <h3 className="font-semibold">{board.name}</h3>
                          )}
                          <p className="text-sm text-muted-foreground">{board.description}</p>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span>{board.elementsCount} éléments</span>
                          <span>Modifié le {board.lastModified.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(board.id);
                            }}>
                              <Star className={`h-4 w-4 mr-2 ${board.isFavorite ? 'fill-current text-yellow-500' : ''}`} />
                              {board.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              setEditingBoardId(board.id);
                            }}>
                              <Settings className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateBoard(board);
                            }}>
                              <Copy className="h-4 w-4 mr-2" />
                              Dupliquer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                              Affecter à une équipe
                            </DropdownMenuLabel>
                            {teams.filter(t => t.id !== "all").map(team => (
                              <DropdownMenuItem 
                                key={team.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSavedBoards(prev => 
                                    prev.map(b => b.id === board.id ? { ...b, teamId: team.id } : b)
                                  );
                                  toast.success(`Tableau affecté à ${team.name}`);
                                }}
                              >
                                <Folder className={`h-4 w-4 mr-2 ${board.teamId === team.id ? 'fill-current' : ''}`} />
                                {team.name}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleExportBoard(board);
                            }}>
                              <Download className="h-4 w-4 mr-2" />
                              Exporter
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleShareBoard(board);
                            }}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Partager
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                setBoardToDelete(board.id);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          onClick={() => handleOpenBoard(board.id)}
                          size="sm"
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Ouvrir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {filteredBoards.length > itemsPerPage && (
            <div className="mt-12 flex justify-center">
              <div className="bg-card rounded-lg border border-border shadow-soft p-2">
                <Pagination>
                  <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
          
          {filteredBoards.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun résultat</h3>
              <p className="text-muted-foreground">
                Aucun tableau ne correspond à votre recherche
              </p>
            </div>
          )}
          
          {filteredBoards.length === 0 && !searchQuery && showFavoritesOnly && (
            <div className="text-center py-12">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun favori</h3>
              <p className="text-muted-foreground">
                Vous n'avez pas encore ajouté de tableaux aux favoris
              </p>
            </div>
          )}
        </>
      )}

      {/* Edit Board Dialog */}
      {editingBoardId && (
        <EditBoardDialog
          isOpen={!!editingBoardId}
          onClose={() => setEditingBoardId(null)}
          onSave={(data) => handleEditBoard(editingBoardId, data)}
          initialData={{
            name: savedBoards.find(b => b.id === editingBoardId)?.name || "",
            description: savedBoards.find(b => b.id === editingBoardId)?.description || "",
            teamId: savedBoards.find(b => b.id === editingBoardId)?.teamId,
            tags: savedBoards.find(b => b.id === editingBoardId)?.tags || []
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!boardToDelete} onOpenChange={() => setBoardToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce tableau ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteBoard}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
