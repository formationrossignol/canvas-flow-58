import type { DragEvent } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ArrowRight,
  Check,
  Clock,
  Copy,
  Dot,
  Edit,
  Filter,
  LayoutGrid,
  List,
  MoreVertical,
  Plus,
  Search,
  Share2,
  Star,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { EditBoardDialog, EditBoardData } from "@/components/EditBoardDialog";
import { PageTitle } from "@/contexts/PageHeaderContext";

interface Collaborator {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

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
  collaboratorIds?: string[];
  isLive?: boolean;
  activityStatus?: "sync" | "idle";
  progress?: number;
}

const collaborators: Collaborator[] = [
  { id: "clara", name: "Clara Morel", role: "Product Designer", avatar: "https://i.pravatar.cc/150?img=65" },
  { id: "alex", name: "Alex Dupont", role: "Lead Developer", avatar: "https://i.pravatar.cc/150?img=56" },
  { id: "nina", name: "Nina Lemaire", role: "UX Researcher", avatar: "https://i.pravatar.cc/150?img=47" },
  { id: "liam", name: "Liam Costa", role: "Growth Strategist", avatar: "https://i.pravatar.cc/150?img=12" },
];

const teams = [
  { id: "all", name: "Toutes les équipes" },
  { id: "team1", name: "Équipe Marketing" },
  { id: "team2", name: "Équipe Produit" },
  { id: "team3", name: "Studio Créatif" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDiagramDialogOpen, setIsDiagramDialogOpen] = useState(false);

  const [savedBoards, setSavedBoards] = useState<SavedBoard[]>([
    {
      id: "1",
      name: "Réunion d'équipe Sprint 12",
      description: "Planning précis et rétrospective pour l'équipe Produit.",
      lastModified: new Date(2024, 0, 15),
      elementsCount: 24,
      isFavorite: true,
      teamId: "team2",
      tags: ["Sprint", "Dev", "Focus"],
      collaboratorIds: ["clara", "alex"],
      isLive: true,
      activityStatus: "sync",
      progress: 72,
    },
    {
      id: "2",
      name: "Brainstorming Produit",
      description: "Nouvelles fonctionnalités Q2 2024 avec scoring d'impact.",
      lastModified: new Date(2024, 1, 3),
      elementsCount: 18,
      isFavorite: true,
      teamId: "team1",
      tags: ["Produit", "Ideation", "Q2"],
      collaboratorIds: ["nina", "liam", "clara"],
      isLive: true,
      activityStatus: "sync",
      progress: 58,
    },
    {
      id: "3",
      name: "Vision stratégique Q1",
      description: "Roadmap haute-fidélité avec KPIs et inspirations design.",
      lastModified: new Date(2023, 11, 28),
      elementsCount: 32,
      isFavorite: false,
      teamId: "team3",
      tags: ["Vision", "Roadmap"],
      collaboratorIds: ["liam", "alex"],
      isLive: false,
      activityStatus: "idle",
      progress: 84,
    },
    {
      id: "4",
      name: "Workshop Innovation",
      description: "Session avec drag-and-drop d'idées et heatmap d'engagement.",
      lastModified: new Date(2024, 1, 9),
      elementsCount: 15,
      isFavorite: false,
      teamId: "team1",
      tags: ["Workshop", "Innovation"],
      collaboratorIds: ["clara", "nina"],
      isLive: true,
      activityStatus: "sync",
      progress: 46,
    },
    {
      id: "5",
      name: "Moodboard Collection",
      description: "Univers visuel premium, textures naturelles et inspirations.",
      lastModified: new Date(2024, 1, 4),
      elementsCount: 40,
      isFavorite: false,
      teamId: "team3",
      tags: ["Design", "Moodboard"],
      collaboratorIds: ["nina"],
      isLive: false,
      activityStatus: "idle",
      progress: 63,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedBoardTags, setSelectedBoardTags] = useState<string[]>([]);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [draggingBoardId, setDraggingBoardId] = useState<string | null>(null);
  const [newBoard, setNewBoard] = useState({ name: "", description: "", teamId: "team1", tags: [] as string[], headerImage: "" });
  const [tagInput, setTagInput] = useState("");

  const allBoardTags = useMemo(
    () => Array.from(new Set(savedBoards.flatMap(b => b.tags ?? []))),
    [savedBoards]
  );

  const filteredBoards = useMemo(() => savedBoards.filter(board => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || board.name.toLowerCase().includes(q) || board.description.toLowerCase().includes(q) || (board.tags ?? []).some(t => t.toLowerCase().includes(q));
    const matchesFavorites = !showFavoritesOnly || board.isFavorite;
    const matchesTeam = selectedTeam === "all" || board.teamId === selectedTeam;
    const matchesTags = selectedBoardTags.length === 0 || selectedBoardTags.every(t => board.tags?.includes(t));
    return matchesSearch && matchesFavorites && matchesTeam && matchesTags;
  }), [savedBoards, searchQuery, showFavoritesOnly, selectedTeam, selectedBoardTags]);

  const totalLiveBoards = savedBoards.filter(b => b.isLive).length;
  const lastUpdatedBoard = [...savedBoards].sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())[0];

  const handleCreateBoard = () => {
    if (!newBoard.name.trim()) { toast.error("Le nom du tableau est requis"); return; }
    const board: SavedBoard = {
      id: `board-${Date.now()}`,
      name: newBoard.name, description: newBoard.description,
      lastModified: new Date(), elementsCount: 0, isFavorite: false,
      teamId: newBoard.teamId, tags: newBoard.tags,
      collaboratorIds: ["clara", "alex"], isLive: true, activityStatus: "sync", progress: 12,
    };
    setSavedBoards(prev => [board, ...prev]);
    toast.success("Tableau créé ✨");
    setIsCreateDialogOpen(false);
    setNewBoard({ name: "", description: "", teamId: "team1", tags: [], headerImage: "" });
    navigate(`/canvas/${board.id}`);
  };

  const handleCreateDiagram = () => {
    if (!newBoard.name.trim()) { toast.error("Le nom du diagramme est requis"); return; }
    const board: SavedBoard = {
      id: `diagram-${Date.now()}`,
      name: newBoard.name, description: newBoard.description,
      lastModified: new Date(), elementsCount: 0, isFavorite: false,
      teamId: newBoard.teamId, tags: [...newBoard.tags, "Diagramme"],
      collaboratorIds: ["nina", "liam"], isLive: true, activityStatus: "sync", progress: 20,
    };
    setSavedBoards(prev => [board, ...prev]);
    toast.success("Diagramme prêt ✨");
    setIsDiagramDialogOpen(false);
    setNewBoard({ name: "", description: "", teamId: "team1", tags: [], headerImage: "" });
    navigate(`/canvas/${board.id}`);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newBoard.tags.includes(tagInput.trim())) {
      setNewBoard(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => setNewBoard(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  const toggleTagFilter = (tag: string) => setSelectedBoardTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const handleDuplicateBoard = (board: SavedBoard) => {
    setSavedBoards(prev => [{ ...board, id: `board-${Date.now()}`, name: `${board.name} (copie)`, lastModified: new Date(), isFavorite: false, isLive: false, activityStatus: "idle" }, ...prev]);
    toast.success("Copie créée");
  };

  const handleDeleteBoard = () => {
    if (boardToDelete) {
      setSavedBoards(prev => prev.filter(b => b.id !== boardToDelete));
      toast.success("Tableau supprimé");
      setBoardToDelete(null);
    }
  };

  const handleSaveBoardEdits = (data: EditBoardData) => {
    setSavedBoards(prev => prev.map(b => b.id === editingBoardId ? { ...b, name: data.name, description: data.description, teamId: data.teamId, tags: data.tags, lastModified: new Date() } : b));
    toast.success("Tableau mis à jour");
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault();
    if (!draggingBoardId || draggingBoardId === targetId) return;
    setSavedBoards(prev => {
      const updated = [...prev];
      const from = updated.findIndex(b => b.id === draggingBoardId);
      const to = updated.findIndex(b => b.id === targetId);
      if (from === -1 || to === -1) return prev;
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  };

  const editingBoard = savedBoards.find(b => b.id === editingBoardId);

  const headerAction = (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 rounded-full border border-border bg-card px-3 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary"
        onClick={() => setIsDiagramDialogOpen(true)}
      >
        Diagramme
      </Button>
      <Button
        size="sm"
        className="h-8 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        onClick={() => setIsCreateDialogOpen(true)}
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" /> Nouveau tableau
      </Button>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-3.25rem)] w-full overflow-y-auto bg-background pb-20">
      <PageTitle title="Mes tableaux" action={headerAction} />

      <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-5 pt-6 md:px-8">

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Tableaux", value: savedBoards.length, icon: <LayoutGrid size={14} /> },
            { label: "En direct", value: totalLiveBoards, icon: <Zap size={14} />, accent: true },
            { label: "Dernière MàJ", value: lastUpdatedBoard?.lastModified.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) ?? "—", icon: <Clock size={14} /> },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-soft">
              <div className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg ${stat.accent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{stat.label}</div>
                <div className="text-base font-semibold text-foreground">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2">
                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="h-7 flex-1 border-0 bg-transparent text-sm placeholder:text-muted-foreground focus-visible:ring-0"
                />
              </div>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="h-9 w-[180px] rounded-lg border border-border bg-card text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2.5">
              <ToggleGroup type="single" value={viewMode} onValueChange={v => v && setViewMode(v as "grid" | "list")}>
                <ToggleGroupItem value="grid" className="h-9 w-9 rounded-lg border border-border bg-muted data-[state=on]:border-primary/50 data-[state=on]:bg-primary/10 data-[state=on]:text-primary">
                  <LayoutGrid className="h-3.5 w-3.5" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" className="h-9 w-9 rounded-lg border border-border bg-muted data-[state=on]:border-primary/50 data-[state=on]:bg-primary/10 data-[state=on]:text-primary">
                  <List className="h-3.5 w-3.5" />
                </ToggleGroupItem>
              </ToggleGroup>
              <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
                <Filter className="h-3 w-3" />
                {filteredBoards.length}
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-[11px] font-semibold text-muted-foreground">
                Favoris
                <Switch checked={showFavoritesOnly} onCheckedChange={setShowFavoritesOnly} className="data-[state=checked]:bg-primary h-4 w-7" />
              </div>
            </div>
          </div>

          {allBoardTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {allBoardTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTagFilter(tag)}
                  className={`rounded-full border px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition ${
                    selectedBoardTags.includes(tag)
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  #{tag}
                  {selectedBoardTags.includes(tag) && <Check className="ml-1 inline h-2.5 w-2.5" />}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Boards */}
        <section className="flex flex-col gap-4">
          {filteredBoards.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-12 text-center shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <LayoutGrid className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Aucun tableau trouvé</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Ajustez vos filtres ou créez un nouveau tableau.</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="rounded-full bg-primary px-4 text-xs text-primary-foreground hover:bg-primary/90" onClick={() => setIsCreateDialogOpen(true)}>Créer un tableau</Button>
                <Button size="sm" variant="ghost" className="rounded-full border border-border bg-card px-4 text-xs hover:border-primary/40 hover:text-primary" onClick={() => setSelectedBoardTags([])}>Réinitialiser</Button>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredBoards.map(board => {
                const boardCollabs = (board.collaboratorIds ?? []).map(id => collaborators.find(c => c.id === id)).filter(Boolean) as Collaborator[];
                const team = teams.find(t => t.id === board.teamId);
                return (
                  <div
                    key={board.id}
                    draggable
                    onDragStart={() => setDraggingBoardId(board.id)}
                    onDragOver={e => handleDragOver(e, board.id)}
                    onDragEnd={() => setDraggingBoardId(null)}
                    className={`group flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-default ${draggingBoardId === board.id ? 'border-primary/50 ring-2 ring-primary/20' : 'border-border'}`}
                  >
                    {/* Card header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          {team && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">{team.name}</span>}
                          {board.isLive && (
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold leading-snug text-foreground line-clamp-1">{board.name}</h3>
                        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{board.description}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => setSavedBoards(prev => prev.map(b => b.id === board.id ? { ...b, isFavorite: !b.isFavorite } : b))}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-muted/60 transition hover:border-amber-300 ${board.isFavorite ? 'text-amber-500' : 'text-muted-foreground'}`}
                        >
                          <Star className={`h-3.5 w-3.5 ${board.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-muted/60 text-muted-foreground transition hover:border-primary/30 hover:text-primary">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-xl border border-border bg-popover">
                            <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => navigate(`/canvas/${board.id}`)} className="cursor-pointer rounded-lg text-xs"><ArrowRight className="mr-2 h-3.5 w-3.5" />Ouvrir</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleDuplicateBoard(board)} className="cursor-pointer rounded-lg text-xs"><Copy className="mr-2 h-3.5 w-3.5" />Dupliquer</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setEditingBoardId(board.id)} className="cursor-pointer rounded-lg text-xs"><Edit className="mr-2 h-3.5 w-3.5" />Renommer</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => toast.success(`Lien partagé pour "${board.name}"`)} className="cursor-pointer rounded-lg text-xs"><Share2 className="mr-2 h-3.5 w-3.5" />Partager</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setBoardToDelete(board.id)} className="cursor-pointer rounded-lg text-xs text-red-500"><Trash2 className="mr-2 h-3.5 w-3.5" />Supprimer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Tags */}
                    {(board.tags ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {(board.tags ?? []).map(tag => (
                          <span key={tag} className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-3">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <div className="flex -space-x-2">
                          {boardCollabs.slice(0, 3).map(c => (
                            <Avatar key={c.id} className="h-6 w-6 border border-card">
                              <AvatarImage src={c.avatar} alt={c.name} />
                              <AvatarFallback className="text-[9px]">{c.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span><Clock className="inline h-3 w-3 mr-0.5" />{board.lastModified.toLocaleDateString("fr-FR")}</span>
                      </div>
                      <Button size="sm" onClick={() => navigate(`/canvas/${board.id}`)} className="h-7 rounded-full bg-primary px-3 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90">
                        Ouvrir <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filteredBoards.map(board => {
                const boardCollabs = (board.collaboratorIds ?? []).map(id => collaborators.find(c => c.id === id)).filter(Boolean) as Collaborator[];
                const team = teams.find(t => t.id === board.teamId);
                return (
                  <div
                    key={board.id}
                    draggable
                    onDragStart={() => setDraggingBoardId(board.id)}
                    onDragOver={e => handleDragOver(e, board.id)}
                    onDragEnd={() => setDraggingBoardId(null)}
                    className={`group flex items-center gap-4 rounded-xl border bg-card px-5 py-4 shadow-soft transition-all duration-200 hover:shadow-md ${draggingBoardId === board.id ? 'border-primary/50 ring-2 ring-primary/20' : 'border-border'}`}
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {team && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">{team.name}</span>}
                        {board.isLive && <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span>}
                        {(board.tags ?? []).map(tag => <span key={tag} className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{tag}</span>)}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground truncate">{board.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{board.description}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="hidden items-center gap-1.5 text-[11px] text-muted-foreground md:flex">
                        <div className="flex -space-x-2">
                          {boardCollabs.slice(0, 3).map(c => (
                            <Avatar key={c.id} className="h-6 w-6 border border-card">
                              <AvatarImage src={c.avatar} alt={c.name} />
                              <AvatarFallback className="text-[9px]">{c.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span><Dot className="inline h-4 w-4" />{board.lastModified.toLocaleDateString("fr-FR")}</span>
                      </div>
                      <button onClick={() => setSavedBoards(prev => prev.map(b => b.id === board.id ? { ...b, isFavorite: !b.isFavorite } : b))} className={`flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-muted/60 transition hover:border-amber-300 ${board.isFavorite ? 'text-amber-500' : 'text-muted-foreground'}`}>
                        <Star className={`h-3.5 w-3.5 ${board.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-muted/60 text-muted-foreground transition hover:border-primary/30 hover:text-primary">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl border border-border bg-popover">
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => navigate(`/canvas/${board.id}`)} className="cursor-pointer rounded-lg text-xs"><ArrowRight className="mr-2 h-3.5 w-3.5" />Ouvrir</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleDuplicateBoard(board)} className="cursor-pointer rounded-lg text-xs"><Copy className="mr-2 h-3.5 w-3.5" />Dupliquer</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setEditingBoardId(board.id)} className="cursor-pointer rounded-lg text-xs"><Edit className="mr-2 h-3.5 w-3.5" />Renommer</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => setBoardToDelete(board.id)} className="cursor-pointer rounded-lg text-xs text-red-500"><Trash2 className="mr-2 h-3.5 w-3.5" />Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button size="sm" onClick={() => navigate(`/canvas/${board.id}`)} className="h-7 rounded-full bg-primary px-3 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90">
                        Ouvrir <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Floating action button */}
      <div className="pointer-events-none fixed bottom-8 right-8 z-50">
        <Button
          size="icon"
          onClick={() => setIsCreateDialogOpen(true)}
          className="pointer-events-auto h-13 w-13 rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-[1.05] hover:bg-primary/90"
          style={{ width: 52, height: 52 }}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Create board dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[480px] rounded-2xl border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">Nouveau tableau</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">Créez un espace collaboratif et invitez votre équipe.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Nom</Label>
              <Input value={newBoard.name} onChange={e => setNewBoard(p => ({ ...p, name: e.target.value }))} placeholder="Ex : Sprint planning Q3" className="h-9 rounded-lg border-border bg-muted/50 text-sm focus-visible:ring-1 focus-visible:ring-primary/30" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Description</Label>
              <Textarea value={newBoard.description} onChange={e => setNewBoard(p => ({ ...p, description: e.target.value }))} placeholder="Description optionnelle..." className="min-h-[80px] rounded-lg border-border bg-muted/50 text-sm focus-visible:ring-1 focus-visible:ring-primary/30" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Équipe</Label>
              <Select value={newBoard.teamId} onValueChange={v => setNewBoard(p => ({ ...p, teamId: v }))}>
                <SelectTrigger className="h-9 rounded-lg border-border bg-muted/50 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{teams.filter(t => t.id !== "all").map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Tags</Label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }} placeholder="Ajouter un tag..." className="h-9 flex-1 rounded-lg border-border bg-muted/50 text-sm focus-visible:ring-1 focus-visible:ring-primary/30" />
                <Button type="button" size="sm" className="h-9 rounded-lg bg-primary text-xs text-primary-foreground hover:bg-primary/90" onClick={handleAddTag}>Ajouter</Button>
              </div>
              {newBoard.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {newBoard.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      #{tag}
                      <button onClick={() => handleRemoveTag(tag)} className="text-muted-foreground hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="mt-2 gap-2">
            <Button variant="ghost" size="sm" className="rounded-lg border border-border bg-card text-xs hover:border-primary/40 hover:text-primary" onClick={() => setIsCreateDialogOpen(false)}>Annuler</Button>
            <Button size="sm" className="rounded-lg bg-primary px-5 text-xs text-primary-foreground hover:bg-primary/90" onClick={handleCreateBoard}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create diagram dialog */}
      <Dialog open={isDiagramDialogOpen} onOpenChange={setIsDiagramDialogOpen}>
        <DialogContent className="max-w-[480px] rounded-2xl border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">Nouveau diagramme</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">Créez un flow collaboratif avec sections et transitions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Nom</Label>
              <Input value={newBoard.name} onChange={e => setNewBoard(p => ({ ...p, name: e.target.value }))} placeholder="Ex : Parcours onboarding" className="h-9 rounded-lg border-border bg-muted/50 text-sm focus-visible:ring-1 focus-visible:ring-primary/30" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Description</Label>
              <Textarea value={newBoard.description} onChange={e => setNewBoard(p => ({ ...p, description: e.target.value }))} placeholder="Description optionnelle..." className="min-h-[80px] rounded-lg border-border bg-muted/50 text-sm focus-visible:ring-1 focus-visible:ring-primary/30" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Équipe</Label>
              <Select value={newBoard.teamId} onValueChange={v => setNewBoard(p => ({ ...p, teamId: v }))}>
                <SelectTrigger className="h-9 rounded-lg border-border bg-muted/50 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{teams.filter(t => t.id !== "all").map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-2 gap-2">
            <Button variant="ghost" size="sm" className="rounded-lg border border-border bg-card text-xs hover:border-primary/40 hover:text-primary" onClick={() => setIsDiagramDialogOpen(false)}>Annuler</Button>
            <Button size="sm" className="rounded-lg bg-primary px-5 text-xs text-primary-foreground hover:bg-primary/90" onClick={handleCreateDiagram}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit board dialog */}
      <EditBoardDialog
        isOpen={Boolean(editingBoardId)}
        onClose={() => setEditingBoardId(null)}
        onSave={handleSaveBoardEdits}
        initialData={{
          name: editingBoard?.name ?? "",
          description: editingBoard?.description ?? "",
          teamId: editingBoard?.teamId,
          tags: editingBoard?.tags ?? [],
          headerImage: editingBoard?.thumbnail,
        }}
      />

      {/* Delete confirmation */}
      <AlertDialog open={Boolean(boardToDelete)} onOpenChange={() => setBoardToDelete(null)}>
        <AlertDialogContent className="max-w-sm rounded-2xl border border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">Supprimer ce tableau ?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">Action irréversible. Toutes les données seront supprimées.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg border border-border bg-card text-xs hover:border-primary/40 hover:text-primary">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBoard} className="rounded-lg bg-destructive text-xs text-destructive-foreground hover:brightness-110">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
