import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Users, Calendar, Grid, Trash2, Edit, Copy } from "lucide-react";
import { toast } from "sonner";

interface SavedBoard {
  id: string;
  name: string;
  description: string;
  lastModified: Date;
  elementsCount: number;
  thumbnail?: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  elementsCount: number;
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

  const [templates] = useState<Template[]>([
    {
      id: "brainstorming",
      name: "Session de Brainstorming",
      description: "Organisez vos idées créatives",
      category: "Créativité",
      elementsCount: 6
    },
    {
      id: "retrospective",
      name: "Rétrospective Agile",
      description: "What went well / What needs improvement",
      category: "Agile",
      elementsCount: 4
    },
    {
      id: "user-journey",
      name: "Parcours Utilisateur",
      description: "Cartographiez l'expérience utilisateur",
      category: "UX",
      elementsCount: 8
    },
    {
      id: "meeting",
      name: "Réunion d'Équipe",
      description: "Agenda et prise de notes collaborative",
      category: "Collaboration",
      elementsCount: 5
    }
  ]);

  const handleCreateNewBoard = () => {
    const boardId = `board-${Date.now()}`;
    navigate(`/canvas/${boardId}`);
  };

  const handleOpenBoard = (boardId: string) => {
    navigate(`/canvas/${boardId}`);
  };

  const handleUseTemplate = (templateId: string) => {
    const boardId = `board-${Date.now()}`;
    navigate(`/canvas/${boardId}?template=${templateId}`);
  };

  const handleDeleteBoard = (boardId: string) => {
    toast.success(`Tableau supprimé`);
  };

  const handleDuplicateBoard = (boardId: string) => {
    toast.success(`Tableau dupliqué`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">CollabBoard</h1>
              <p className="text-muted-foreground">Tableau collaboratif en temps réel</p>
            </div>
            <Button onClick={handleCreateNewBoard} size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Tableau
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="boards" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="boards" className="gap-2">
              <Grid className="h-4 w-4" />
              Mes Tableaux
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="boards" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Mes Tableaux</h2>
              <div className="text-sm text-muted-foreground">
                {savedBoards.length} tableau(x) sauvegardé(s)
              </div>
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
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Templates</h2>
              <div className="text-sm text-muted-foreground">
                {templates.length} template(s) disponible(s)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {template.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>{template.elementsCount} éléments</span>
                    </div>
                    <Button 
                      onClick={() => handleUseTemplate(template.id)} 
                      className="w-full gap-2"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                      Utiliser ce template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;