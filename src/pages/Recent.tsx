import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Edit, MoreVertical, Star, FileEdit, Download, Share2, Copy, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface RecentBoard {
  id: string;
  name: string;
  description: string;
  lastOpened: Date;
  elementsCount: number;
  isFavorite?: boolean;
}

const Recent = () => {
  const navigate = useNavigate();
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  const [recentBoards, setRecentBoards] = useState<RecentBoard[]>([
    {
      id: "1",
      name: "Réunion d'équipe Sprint 12",
      description: "Planning et retrospective de l'équipe dev",
      lastOpened: new Date(2024, 0, 15, 14, 30),
      elementsCount: 12,
      isFavorite: true
    },
    {
      id: "2",
      name: "Brainstorming Produit",
      description: "Nouvelles fonctionnalités Q1 2024",
      lastOpened: new Date(2024, 0, 15, 10, 15),
      elementsCount: 8,
      isFavorite: false
    }
  ]);

  const toggleFavorite = (boardId: string) => {
    setRecentBoards(prev =>
      prev.map(board =>
        board.id === boardId
          ? { ...board, isFavorite: !board.isFavorite }
          : board
      )
    );
  };

  const startRenaming = (boardId: string, currentName: string) => {
    setEditingBoardId(boardId);
    setEditingName(currentName);
  };

  const handleRenameBoard = (boardId: string) => {
    if (editingName.trim()) {
      setRecentBoards(prev =>
        prev.map(board =>
          board.id === boardId ? { ...board, name: editingName } : board
        )
      );
      toast.success("Tableau renommé");
    }
    setEditingBoardId(null);
    setEditingName("");
  };

  const handleDuplicateBoard = (boardId: string) => {
    const board = recentBoards.find(b => b.id === boardId);
    if (board) {
      const newBoard = {
        ...board,
        id: `board-${Date.now()}`,
        name: `${board.name} (copie)`,
        lastOpened: new Date()
      };
      setRecentBoards(prev => [...prev, newBoard]);
      toast.success("Tableau dupliqué");
    }
  };

  const handleExportBoard = (board: RecentBoard) => {
    const dataStr = JSON.stringify(board, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${board.name || 'tableau'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success("Tableau exporté");
  };

  const handleShareBoard = (boardId: string) => {
    const shareUrl = `${window.location.origin}/canvas/${boardId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Lien copié dans le presse-papiers!");
  };

  const confirmDeleteBoard = () => {
    if (boardToDelete) {
      setRecentBoards(prev => prev.filter(board => board.id !== boardToDelete));
      toast.success("Tableau supprimé");
      setBoardToDelete(null);
    }
  };

  const handleOpenBoard = (boardId: string) => {
    navigate(`/canvas/${boardId}`);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">Tableaux Récents</h2>
        </div>
      </div>

      {recentBoards.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun tableau récent</h3>
            <p className="text-muted-foreground">
              Les tableaux que vous ouvrez apparaîtront ici
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentBoards.map((board) => (
            <Card key={board.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingBoardId === board.id ? (
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameBoard(board.id);
                          if (e.key === 'Escape') {
                            setEditingBoardId(null);
                            setEditingName("");
                          }
                        }}
                        onBlur={() => handleRenameBoard(board.id)}
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
                        startRenaming(board.id, board.name);
                      }}>
                        <FileEdit className="h-4 w-4 mr-2" />
                        Renommer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateBoard(board.id);
                      }}>
                        <Copy className="h-4 w-4 mr-2" />
                        Dupliquer
                      </DropdownMenuItem>
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
                        handleShareBoard(board.id);
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
                  <span>Il y a {Math.floor((Date.now() - board.lastOpened.getTime()) / (1000 * 60))} min</span>
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
      )}

      <AlertDialog open={boardToDelete !== null} onOpenChange={(open) => !open && setBoardToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce tableau ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteBoard} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Recent;
