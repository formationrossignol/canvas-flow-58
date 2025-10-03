import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Grid, Trash2, Edit, Copy, Search, Download, LayoutGrid, List, Star, Share2, FileEdit, MoreVertical, Folder } from "lucide-react";
import { toast } from "sonner";
import { Toggle } from "@/components/ui/toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SavedBoard {
  id: string;
  name: string;
  description: string;
  lastModified: Date;
  elementsCount: number;
  thumbnail?: string;
  isFavorite?: boolean;
  teamId?: string;
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
      teamId: "team2"
    },
    {
      id: "2", 
      name: "Brainstorming Produit",
      description: "Nouvelles fonctionnalités Q1 2024",
      lastModified: new Date(2024, 0, 10),
      elementsCount: 8,
      isFavorite: false,
      teamId: "team1"
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
  const [newBoard, setNewBoard] = useState({
    name: "",
    description: "",
    teamId: "team1"
  });
  
  const teams = [
    { id: "all", name: "Tous les tableaux" },
    { id: "team1", name: "Équipe Marketing" },
    { id: "team2", name: "Équipe Dev" },
    { id: "team3", name: "Projets Perso" }
  ];

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
      teamId: newBoard.teamId
    };

    setSavedBoards(prev => [...prev, board]);
    toast.success("Tableau créé");
    setIsCreateDialogOpen(false);
    setNewBoard({ name: "", description: "", teamId: "team1" });
    navigate(`/canvas/${board.id}`);
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

  const filteredBoards = savedBoards.filter(board => {
    const matchesSearch = board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !showFavoritesOnly || board.isFavorite;
    const matchesTeam = selectedTeam === "all" || board.teamId === selectedTeam;
    return matchesSearch && matchesFavorite && matchesTeam;
  });

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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setNewBoard({ name: "", description: "", teamId: "team1" });
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
        <h2 className="text-2xl font-semibold">Mes Tableaux</h2>
        <div className="flex gap-2">
          <Button onClick={handleCreateNewBoard} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Tableau
          </Button>
        </div>
      </div>

      {/* Search Bar and View Controls */}
      {savedBoards.length > 0 && (
        <div className="mb-6 flex items-center justify-between gap-4">
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
              {filteredBoards.map((board) => (
                <Card key={board.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
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
                          <CardTitle className="text-lg line-clamp-1">{board.name}</CardTitle>
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
                            className="h-8 w-8 p-0 ml-2"
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
                            setRenamingBoardId(board.id);
                            setNewBoardName(board.name);
                          }}>
                            <FileEdit className="h-4 w-4 mr-2" />
                            Renommer
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
                            className="text-destructive hover:text-destructive focus:text-destructive"
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
              {filteredBoards.map((board) => (
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
                              setRenamingBoardId(board.id);
                              setNewBoardName(board.name);
                            }}>
                              <FileEdit className="h-4 w-4 mr-2" />
                              Renommer
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
                              className="text-destructive hover:text-destructive focus:text-destructive"
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
