import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Edit } from "lucide-react";

interface RecentBoard {
  id: string;
  name: string;
  description: string;
  lastOpened: Date;
  elementsCount: number;
}

const Recent = () => {
  const navigate = useNavigate();
  const [recentBoards] = useState<RecentBoard[]>([
    {
      id: "1",
      name: "Réunion d'équipe Sprint 12",
      description: "Planning et retrospective de l'équipe dev",
      lastOpened: new Date(2024, 0, 15, 14, 30),
      elementsCount: 12
    },
    {
      id: "2",
      name: "Brainstorming Produit",
      description: "Nouvelles fonctionnalités Q1 2024",
      lastOpened: new Date(2024, 0, 15, 10, 15),
      elementsCount: 8
    }
  ]);

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
                    <CardTitle className="text-lg line-clamp-1">{board.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {board.description}
                    </CardDescription>
                  </div>
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
    </div>
  );
};

export default Recent;
