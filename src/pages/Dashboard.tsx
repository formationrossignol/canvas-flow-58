import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Grid, Trash2, Edit, Copy } from "lucide-react";
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
  const [savedBoards] = useState<SavedBoard[]>([
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

  const handleCreateNewBoard = () => {
    const boardId = `board-${Date.now()}`;
    navigate(`/canvas/${boardId}`);
  };

  const handleOpenBoard = (boardId: string) => {
    navigate(`/canvas/${boardId}`);
  };

  const handleDeleteBoard = (boardId: string) => {
    toast.success(`Tableau supprimé`);
  };

  const handleDuplicateBoard = (boardId: string) => {
    toast.success(`Tableau dupliqué`);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Mes Tableaux</h2>
        <Button onClick={handleCreateNewBoard} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau Tableau
        </Button>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedBoards.map((board) => (
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
                        handleDuplicateBoard(board.id);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBoard(board.id);
                      }}
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
      )}
    </div>
  );
};

export default Dashboard;
