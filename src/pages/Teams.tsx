import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Folder, Plus, Edit2, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Team {
  id: string;
  name: string;
  description: string;
  boardCount: number;
  color: string;
}

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([
    {
      id: "team1",
      name: "Équipe Marketing",
      description: "Tous les tableaux liés au marketing",
      boardCount: 5,
      color: "hsl(15, 85%, 75%)"
    },
    {
      id: "team2",
      name: "Équipe Dev",
      description: "Tableaux techniques et développement",
      boardCount: 8,
      color: "hsl(224, 55%, 65%)"
    },
    {
      id: "team3",
      name: "Projets Perso",
      description: "Mes projets personnels",
      boardCount: 3,
      color: "hsl(150, 45%, 65%)"
    }
  ]);

  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", color: "#6B9BD1" });

  const handleCreateTeam = () => {
    if (!formData.name.trim()) {
      toast.error("Le nom de l'équipe est requis");
      return;
    }

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      boardCount: 0,
      color: formData.color
    };

    setTeams([...teams, newTeam]);
    setIsCreateDialogOpen(false);
    setFormData({ name: "", description: "", color: "#6B9BD1" });
    toast.success("Équipe créée avec succès");
  };

  const handleUpdateTeam = () => {
    if (!editingTeam || !formData.name.trim()) {
      toast.error("Le nom de l'équipe est requis");
      return;
    }

    setTeams(teams.map(team => 
      team.id === editingTeam.id 
        ? { ...team, name: formData.name, description: formData.description, color: formData.color }
        : team
    ));
    setEditingTeam(null);
    setFormData({ name: "", description: "", color: "#6B9BD1" });
    toast.success("Équipe mise à jour");
  };

  const handleDeleteTeam = () => {
    if (teamToDelete) {
      setTeams(teams.filter(team => team.id !== teamToDelete));
      toast.success("Équipe supprimée");
      setTeamToDelete(null);
    }
  };

  const startEditing = (team: Team) => {
    setEditingTeam(team);
    setFormData({ 
      name: team.name, 
      description: team.description, 
      color: team.color 
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">Gestion des équipes</h2>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle Équipe
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune équipe</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre première équipe pour organiser vos tableaux
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Créer une équipe
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: team.color }}
                    >
                      <Folder className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{team.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {team.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>{team.boardCount} tableau{team.boardCount > 1 ? 'x' : ''}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => startEditing(team)} 
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Modifier
                  </Button>
                  <Button 
                    onClick={() => setTeamToDelete(team.id)}
                    variant="outline"
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || editingTeam !== null} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setEditingTeam(null);
          setFormData({ name: "", description: "", color: "#6B9BD1" });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeam ? "Modifier l'équipe" : "Créer une équipe"}</DialogTitle>
            <DialogDescription>
              {editingTeam 
                ? "Modifiez les informations de l'équipe" 
                : "Créez une nouvelle équipe pour organiser vos tableaux"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'équipe</Label>
              <Input
                id="name"
                placeholder="Ex: Équipe Marketing"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Description de l'équipe"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Couleur</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#6B9BD1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setEditingTeam(null);
                setFormData({ name: "", description: "", color: "#6B9BD1" });
              }}
            >
              Annuler
            </Button>
            <Button onClick={editingTeam ? handleUpdateTeam : handleCreateTeam}>
              {editingTeam ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={teamToDelete !== null} onOpenChange={(open) => !open && setTeamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette équipe ? Les tableaux ne seront pas supprimés mais ne seront plus associés à cette équipe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTeam}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Teams;
