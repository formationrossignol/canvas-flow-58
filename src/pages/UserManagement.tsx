import { useMemo, useState } from "react";
import { Users, UserPlus, Shield, Target, Wrench, BookOpen, Pencil, Trash2, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const roles = {
  administrateur: {
    label: "Administrateur",
    description:
      "Supervise l'organisation, gère la sécurité et configure l'environnement collaboratif.",
    icon: Shield,
    responsibilities: [
      "Gestion des accès et des espaces de travail",
      "Configuration des méthodologies et des templates",
      "Suivi de la conformité et de la sécurité",
    ],
  },
  productOwner: {
    label: "Product Owner",
    description:
      "Porte la vision produit, priorise le backlog et valide la valeur délivrée.",
    icon: Target,
    responsibilities: [
      "Priorisation du Product Backlog",
      "Communication de la vision et des objectifs",
      "Validation de l'incrément et des livrables",
    ],
  },
  developpeur: {
    label: "Développeur",
    description:
      "Conçoit, développe et teste les fonctionnalités avec l'équipe agile.",
    icon: Wrench,
    responsibilities: [
      "Livraison incrémentale de valeur",
      "Qualité technique et revues de code",
      "Participation active aux rituels agiles",
    ],
  },
  scrumMaster: {
    label: "Scrum Master",
    description:
      "Facilite les rituels, accompagne l'équipe et supprime les obstacles.",
    icon: BookOpen,
    responsibilities: [
      "Animation des cérémonies agile",
      "Coaching sur les pratiques et principes",
      "Levée des impediments",
    ],
  },
};

type RoleKey = keyof typeof roles;

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: RoleKey;
  squads: string[];
}

const initialUsers: UserProfile[] = [
  {
    id: "1",
    name: "Alice Dupont",
    email: "alice.dupont@example.com",
    role: "administrateur",
    squads: ["Plateforme", "Data"],
  },
  {
    id: "2",
    name: "Benoît Martin",
    email: "benoit.martin@example.com",
    role: "productOwner",
    squads: ["Expérience client"],
  },
  {
    id: "3",
    name: "Camille Leroy",
    email: "camille.leroy@example.com",
    role: "scrumMaster",
    squads: ["Mobile", "Growth"],
  },
  {
    id: "4",
    name: "David N'Guyen",
    email: "david.nguyen@example.com",
    role: "developpeur",
    squads: ["Plateforme"],
  },
];

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleKey | "all">("all");
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const roleCounts = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        acc[user.role] += 1;
        return acc;
      },
      {
        administrateur: 0,
        productOwner: 0,
        developpeur: 0,
        scrumMaster: 0,
      } satisfies Record<RoleKey, number>,
    );
  }, [users]);

  const handleOpenDialog = (user?: UserProfile) => {
    setEditingUser(
      user ?? {
        id: `user-${Date.now()}`,
        name: "",
        email: "",
        role: "developpeur",
        squads: [],
      },
    );
    setIsDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!editingUser) return;

    if (!editingUser.name.trim() || !editingUser.email.trim()) {
      toast.error("Le nom et l'email sont requis");
      return;
    }

    setUsers((prev) => {
      const exists = prev.some((user) => user.id === editingUser.id);
      return exists
        ? prev.map((user) => (user.id === editingUser.id ? editingUser : user))
        : [...prev, editingUser];
    });

    toast.success("Profil enregistré");
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    setUsers((prev) => prev.filter((user) => user.id !== userToDelete.id));
    toast.success("Utilisateur supprimé");
    setUserToDelete(null);
  };

  const buildInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7" />
          <div>
            <h2 className="text-2xl font-semibold">Gestion des utilisateurs</h2>
            <p className="text-muted-foreground">
              Attribuez les bons rôles à chaque membre pour sécuriser vos workflows agiles.
            </p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()} className="self-start md:self-auto gap-2">
          <UserPlus className="h-4 w-4" />
          Nouvel utilisateur
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(roles) as RoleKey[]).map((roleKey) => {
          const role = roles[roleKey];
          const Icon = role.icon;
          return (
            <Card key={roleKey}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{role.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{roleCounts[roleKey]}</div>
                <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Annuaire des membres</CardTitle>
          <CardDescription>
            Filtrez par rôle et vérifiez l'équilibre de vos profils sur les équipes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-3">
              <div className="flex-1">
                <Label htmlFor="search">Rechercher</Label>
                <Input
                  id="search"
                  placeholder="Nom ou email"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="w-full md:w-60">
                <Label htmlFor="role-filter" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Filtrer par profil
                </Label>
                <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleKey | "all")}> 
                  <SelectTrigger id="role-filter">
                    <SelectValue placeholder="Tous les rôles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    {(Object.keys(roles) as RoleKey[]).map((roleKey) => (
                      <SelectItem key={roleKey} value={roleKey}>
                        {roles[roleKey].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-[460px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profil</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Squads</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                      Aucun utilisateur ne correspond aux filtres.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const role = roles[user.role];
                    return (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>{buildInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium leading-none">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {role.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.squads.length > 0 ? (
                              user.squads.map((squad) => (
                                <Badge key={squad} variant="secondary">
                                  {squad}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">Aucune squad</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(user)}
                              aria-label={`Modifier ${user.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => setUserToDelete(user)}
                              aria-label={`Supprimer ${user.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comprendre les profils</CardTitle>
          <CardDescription>
            Alignez la responsabilité de chacun sur votre méthodologie agile de référence.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(Object.keys(roles) as RoleKey[]).map((roleKey) => {
            const role = roles[roleKey];
            const Icon = role.icon;
            return (
              <div
                key={roleKey}
                className="rounded-xl border bg-muted/40 p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">{role.label}</p>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {role.responsibilities.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingUser && users.some((user) => user.id === editingUser.id)
                ? "Modifier le profil"
                : "Créer un profil"}
            </DialogTitle>
            <DialogDescription>
              Définissez les informations de l'utilisateur et son rôle agile principal.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={editingUser.name}
                  onChange={(event) =>
                    setEditingUser({ ...editingUser, name: event.target.value })
                  }
                  placeholder="Ex: Marie Curie"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email professionnel</Label>
                <Input
                  id="email"
                  type="email"
                  value={editingUser.email}
                  onChange={(event) =>
                    setEditingUser({ ...editingUser, email: event.target.value })
                  }
                  placeholder="prenom.nom@entreprise.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) =>
                    setEditingUser({ ...editingUser, role: value as RoleKey })
                  }
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Choisissez un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(roles) as RoleKey[]).map((roleKey) => (
                      <SelectItem key={roleKey} value={roleKey}>
                        {roles[roleKey].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="squads">Squads (séparés par des virgules)</Label>
                <Input
                  id="squads"
                  value={editingUser.squads.join(", ")}
                  onChange={(event) =>
                    setEditingUser({
                      ...editingUser,
                      squads: event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Plateforme, Mobile, Growth"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveUser}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les accès à toutes les équipes seront supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
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

export default UserManagement;
