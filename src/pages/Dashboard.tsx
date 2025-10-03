import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Grid, Trash2, Edit, Copy, Search, Download } from "lucide-react";
import { toast } from "sonner";

interface SavedBoard {
  id: string;
  name: string;
  description: string;
  lastModified: Date;
  elementsCount: number;
  thumbnail?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [savedBoards, setSavedBoards] = useState<SavedBoard[]>([
    {
      id: "1",
      name: "Réunion d'équipe Sprint 12",
      description: "Planning et retrospective de l'équipe dev",
      lastModified: new Date(2024, 0, 15),
      elementsCount: 12
    },
    {
      id: "2", 
      name: "Brainstorming Produit",
      description: "Nouvelles fonctionnalités Q1 2024",
      lastModified: new Date(2024, 0, 10),
      elementsCount: 8
    }
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);

  const handleCreateNewBoard = () => {
    const boardId = `board-${Date.now()}`;
    navigate(`/canvas/${boardId}`);
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

  const handleExportBoards = () => {
    const dataStr = JSON.stringify(savedBoards, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `collabboard-export-${Date.now()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success("Tableaux exportés");
  };

  const filteredBoards = savedBoards.filter(board => 
    board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    board.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Mes Tableaux</h2>
        <div className="flex gap-2">
          <Button onClick={handleExportBoards} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Button onClick={handleCreateNewBoard} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Tableau
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {savedBoards.length > 0 && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher un tableau..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
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
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBoards.map((board) => (
              <Card key={board.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{board.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {board.description}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateBoard(board);
                        }}
                        title="Dupliquer"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBoardToDelete(board.id);
                        }}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
          
          {filteredBoards.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun résultat</h3>
              <p className="text-muted-foreground">
                Aucun tableau ne correspond à votre recherche
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
