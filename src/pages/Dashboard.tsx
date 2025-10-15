import type { DragEvent } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Activity,
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Dot,
  Edit,
  Filter,
  Grid3X3,
  LayoutGrid,
  LineChart,
  List,
  MoreVertical,
  Plus,
  Search,
  Share2,
  Sparkles,
  Star,
  Sun,
  Trash2,
  Users,
  Wand2,
} from "lucide-react";
import { EditBoardDialog, EditBoardData } from "@/components/EditBoardDialog";

interface Collaborator {
  id: string;
  name: string;
  role: string;
  avatar: string;
  accent: string;
}

interface ActivityItem {
  id: string;
  boardId: string;
  boardName: string;
  action: string;
  time: string;
  userId: string;
  accent: "primary" | "secondary" | "accent";
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
  {
    id: "clara",
    name: "Clara Morel",
    role: "Product Designer",
    avatar: "https://i.pravatar.cc/150?img=65",
    accent: "bg-gradient-to-tr from-emerald-300/80 to-emerald-500/60",
  },
  {
    id: "alex",
    name: "Alex Dupont",
    role: "Lead Developer",
    avatar: "https://i.pravatar.cc/150?img=56",
    accent: "bg-gradient-to-tr from-amber-200/80 to-amber-400/60",
  },
  {
    id: "nina",
    name: "Nina Lemaire",
    role: "UX Researcher",
    avatar: "https://i.pravatar.cc/150?img=47",
    accent: "bg-gradient-to-tr from-rose-200/80 to-rose-400/60",
  },
  {
    id: "liam",
    name: "Liam Costa",
    role: "Growth Strategist",
    avatar: "https://i.pravatar.cc/150?img=12",
    accent: "bg-gradient-to-tr from-sky-200/80 to-sky-400/60",
  },
];

const heroHighlights = [
  {
    icon: <Grid3X3 className="h-4 w-4" />,
    title: "Templates immersifs",
    description: "Brainstorming, roadmaps, revues créatives et workshops prêts à l'emploi.",
  },
  {
    icon: <LineChart className="h-4 w-4" />,
    title: "Insights en temps réel",
    description: "Suivi des interactions et indicateurs d'engagement live.",
  },
  {
    icon: <Users className="h-4 w-4" />,
    title: "Collaborateurs synchronisés",
    description: "Avatars actifs, réactions instantanées, drag-and-drop fluide.",
  },
];

const teams = [
  { id: "all", name: "Toutes les équipes" },
  { id: "team1", name: "Équipe Marketing" },
  { id: "team2", name: "Équipe Produit" },
  { id: "team3", name: "Studio Créatif" },
];

const activityFeed: ActivityItem[] = [
  {
    id: "activity-1",
    boardId: "1",
    boardName: "Sprint 12",
    action: "a ajouté une note stratégique",
    time: "Il y a 5 min",
    userId: "clara",
    accent: "primary",
  },
  {
    id: "activity-2",
    boardId: "2",
    boardName: "Brainstorm Produit",
    action: "a approuvé la proposition",
    time: "Il y a 12 min",
    userId: "alex",
    accent: "accent",
  },
  {
    id: "activity-3",
    boardId: "3",
    boardName: "Vision Q1",
    action: "a partagé le tableau avec le comité",
    time: "Il y a 26 min",
    userId: "nina",
    accent: "secondary",
  },
  {
    id: "activity-4",
    boardId: "4",
    boardName: "Workshop innovation",
    action: "a ajouté 4 nouvelles idées",
    time: "Il y a 1 h",
    userId: "liam",
    accent: "primary",
  },
];

const moodChips = [
  "Calme",
  "Clarté",
  "Vision",
  "Momentum",
  "Premium",
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [savedBoards, setSavedBoards] = useState<SavedBoard[]>([
    {
      id: "1",
      name: "Réunion d'équipe Sprint 12",
      description: "Planning précis et rétrospective immersive pour l'équipe Produit.",
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
      description: "Session immersive avec drag-and-drop d'idées et heatmap d'engagement.",
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
      description: "Univers visuel premium, textures naturelles et inspirations matérielles.",
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDiagramDialogOpen, setIsDiagramDialogOpen] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [draggingBoardId, setDraggingBoardId] = useState<string | null>(null);
  const [newBoard, setNewBoard] = useState({
    name: "",
    description: "",
    teamId: "team1",
    tags: [] as string[],
    headerImage: "",
  });
  const [tagInput, setTagInput] = useState("");

  const allBoardTags = useMemo(
    () => Array.from(new Set(savedBoards.flatMap(board => board.tags ?? []))),
    [savedBoards]
  );

  const filteredBoards = useMemo(() => {
    return savedBoards.filter(board => {
      const matchesSearch =
        !searchQuery.trim() ||
        board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        board.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (board.tags ?? []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFavorites = !showFavoritesOnly || board.isFavorite;
      const matchesTeam = selectedTeam === "all" || board.teamId === selectedTeam;
      const matchesTags =
        selectedBoardTags.length === 0 ||
        selectedBoardTags.every(tag => board.tags?.includes(tag));

      return matchesSearch && matchesFavorites && matchesTeam && matchesTags;
    });
  }, [savedBoards, searchQuery, showFavoritesOnly, selectedTeam, selectedBoardTags]);

  const trendingTags = useMemo(() => {
    const base = new Set([...allBoardTags, "Premium", "Immersif", "Live"]);
    return Array.from(base);
  }, [allBoardTags]);

  const totalLiveBoards = filteredBoards.filter(board => board.isLive).length;
  const lastUpdatedBoard = filteredBoards
    .slice()
    .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())[0];

  const handleCreateBoard = () => {
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
      tags: newBoard.tags,
      collaboratorIds: ["clara", "alex"],
      isLive: true,
      activityStatus: "sync",
      progress: 12,
    };

    setSavedBoards(prev => [board, ...prev]);
    toast.success("Tableau créé avec élégance ✨");
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
      tags: [...newBoard.tags, "Diagramme"],
      collaboratorIds: ["nina", "liam"],
      isLive: true,
      activityStatus: "sync",
      progress: 20,
    };

    setSavedBoards(prev => [board, ...prev]);
    toast.success("Diagramme prêt à être exploré ✨");
    setIsDiagramDialogOpen(false);
    setNewBoard({ name: "", description: "", teamId: "team1", tags: [], headerImage: "" });
    navigate(`/canvas/${board.id}`);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newBoard.tags.includes(tagInput.trim())) {
      setNewBoard(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewBoard(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedBoardTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleDuplicateBoard = (board: SavedBoard) => {
    const duplicated: SavedBoard = {
      ...board,
      id: `board-${Date.now()}`,
      name: `${board.name} (copie)`,
      lastModified: new Date(),
      isFavorite: false,
      isLive: false,
      activityStatus: "idle",
    };
    setSavedBoards(prev => [duplicated, ...prev]);
    toast.success("Copie prête à être personnalisée");
  };

  const handleShareBoard = (board: SavedBoard) => {
    toast.success(`Lien partagé pour "${board.name}"`);
  };

  const handleDeleteBoard = () => {
    if (boardToDelete) {
      setSavedBoards(prev => prev.filter(board => board.id !== boardToDelete));
      toast.success("Tableau retiré avec succès");
      setBoardToDelete(null);
    }
  };

  const handleOpenBoard = (boardId: string) => {
    navigate(`/canvas/${boardId}`);
  };

  const handleToggleFavorite = (boardId: string) => {
    setSavedBoards(prev =>
      prev.map(board =>
        board.id === boardId
          ? { ...board, isFavorite: !board.isFavorite }
          : board
      )
    );
  };

  const handleSaveBoardEdits = (data: EditBoardData) => {
    setSavedBoards(prev =>
      prev.map(board =>
        board.id === editingBoardId
          ? {
              ...board,
              name: data.name,
              description: data.description,
              teamId: data.teamId,
              tags: data.tags,
              lastModified: new Date(),
            }
          : board
      )
    );
    toast.success("Tableau mis à jour avec soin");
  };

  const handleDragStart = (boardId: string) => {
    setDraggingBoardId(boardId);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault();
    if (!draggingBoardId || draggingBoardId === targetId) return;

    setSavedBoards(prev => {
      const updated = [...prev];
      const fromIndex = updated.findIndex(board => board.id === draggingBoardId);
      const toIndex = updated.findIndex(board => board.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handleDragEnd = () => {
    setDraggingBoardId(null);
  };

  const activeMood = moodChips[(filteredBoards.length + totalLiveBoards) % moodChips.length];
  const isDark = theme === "dark";
  const editingBoard = savedBoards.find(board => board.id === editingBoardId);

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] w-full overflow-y-auto bg-transparent pb-24">
      <div className="premium-gradient glass-spotlight pointer-events-none absolute inset-0 -z-10" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35)_0%,transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(253,224,144,0.15)_0%,transparent_60%)]" />

      <div className="relative z-10 mx-auto flex max-w-[1400px] flex-col gap-8 px-5 pt-8 md:px-10">
        {/* Top Navigation */}
        <header className="glass-effect sheen-highlight relative flex flex-col gap-6 rounded-3xl border-white/30 p-6 shadow-soft transition-all duration-500 ease-in-out hover:shadow-glow md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex items-center gap-4">
              <div className="floating-element relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/50 to-accent/40 shadow-soft">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="absolute -bottom-1 right-2 h-2.5 w-2.5 rounded-full bg-emerald-400">
                  <span className="absolute inset-0 rounded-full bg-emerald-400/60 animate-ping" />
                </span>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.45em] text-muted-foreground">Canvas Flow</p>
                <h1 className="text-2xl font-semibold text-foreground">Espace de travail premium</h1>
              </div>
            </div>

            <div className="hidden flex-1 items-center gap-2 rounded-2xl border border-white/20 bg-white/40 p-1 backdrop-blur-lg transition hover:border-primary/40 dark:bg-white/5 md:flex">
              <Search className="ml-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                placeholder="Rechercher un tableau, un tag ou un collaborateur..."
                className="h-10 flex-1 border-0 bg-transparent text-sm placeholder:text-muted-foreground focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/30 bg-white/40 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-lg md:flex dark:bg-white/10">
              <Dot className="h-5 w-5 text-green-500" />
              {totalLiveBoards} board(s) en direct
            </div>
            <div className="flex items-center gap-3 rounded-full border border-white/30 bg-white/50 px-2 py-1 backdrop-blur-lg dark:bg-white/5">
              <Sun className="h-4 w-4 text-amber-500" />
              <Switch
                checked={isDark}
                onCheckedChange={checked => setTheme(checked ? "dark" : "light")}
                className="data-[state=checked]:bg-primary/70"
              />
            </div>
            <div className="flex items-center -space-x-3 rounded-full border border-white/30 bg-white/60 px-4 py-2 backdrop-blur-lg dark:bg-white/5">
              {collaborators.map(person => (
                <Avatar key={person.id} className="h-9 w-9 border-2 border-white shadow-soft">
                  <AvatarImage src={person.avatar} alt={person.name} className="object-cover" />
                  <AvatarFallback className="bg-muted text-xs font-medium uppercase">{person.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
          <Card className="relative overflow-hidden rounded-[32px] border-none bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-0 shadow-soft backdrop-blur-3xl dark:from-white/10 dark:via-white/5 dark:to-white/0">
            <div className="absolute inset-0 opacity-90" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, hsla(37,79%,75%,0.35), transparent 60%), radial-gradient(circle at 80% 0%, hsla(151,32%,46%,0.28), transparent 60%)" }} />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')] opacity-10 mix-blend-soft-light" />
            <CardContent className="relative flex flex-col gap-8 p-8 md:p-12">
              <div className="flex flex-col gap-4 text-balance">
                <Badge className="w-fit rounded-full border border-white/40 bg-white/60 px-4 py-1 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground backdrop-blur-xl dark:bg-white/10">
                  Luxurious flow
                </Badge>
                <h2 className="text-3xl font-semibold leading-tight text-foreground md:text-4xl">
                  Organisez vos idées avec une <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">fluidité premium</span>
                </h2>
                <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                  Une surface immersive inspirée d'Apple et Notion : glassmorphism, micro-interactions et profondeur lumineuse. Concevez, structurez et partagez vos stratégies avec élégance.
                </p>
              </div>

              <div className="flex flex-col gap-4 rounded-3xl border border-white/40 bg-white/40 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/10 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20 text-primary shadow-inner">
                    <Wand2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mode focus</p>
                    <p className="text-lg font-semibold">{filteredBoards.length} espaces raffinés</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button size="lg" className="h-11 rounded-full bg-primary/80 px-6 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary hover:shadow-glow" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Nouveau tableau
                  </Button>
                  <Button variant="ghost" size="lg" className="h-11 rounded-full border border-white/30 bg-white/60 px-6 text-sm font-semibold text-foreground backdrop-blur-lg transition hover:border-primary/40 hover:text-primary dark:bg-white/5" onClick={() => setIsDiagramDialogOpen(true)}>
                    Diagramme immersif
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {heroHighlights.map(highlight => (
                  <div key={highlight.title} className="group flex items-start gap-4 rounded-2xl border border-white/40 bg-white/40 p-4 backdrop-blur-xl transition duration-500 ease-in-out hover:border-primary/40 hover:shadow-glow dark:border-white/10 dark:bg-white/5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/40 to-accent/30 text-primary shadow-inner">
                      {highlight.icon}
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-semibold text-foreground">{highlight.title}</h3>
                      <p className="text-sm text-muted-foreground">{highlight.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-white/30 bg-white/30 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.4em] text-muted-foreground">
                    <Dot className="h-5 w-5 text-green-500" />Synchronisation
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Dernière mise à jour : {lastUpdatedBoard ? lastUpdatedBoard.lastModified.toLocaleDateString("fr-FR", { day: "numeric", month: "long" }) : "-"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-3">
                    {collaborators.slice(0, 3).map(person => (
                      <Avatar key={person.id} className="h-8 w-8 border border-white text-xs shadow-soft">
                        <AvatarImage src={person.avatar} alt={person.name} />
                        <AvatarFallback>{person.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <Badge variant="outline" className="rounded-full border-white/40 bg-white/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground backdrop-blur-lg dark:bg-white/5">
                    {activeMood}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative flex h-full flex-col overflow-hidden rounded-[28px] border-none bg-white/55 shadow-soft backdrop-blur-2xl dark:bg-white/10">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-accent/40 via-transparent to-transparent" />
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-lg font-semibold">Activité en temps réel</CardTitle>
              <CardDescription className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4 text-primary" />
                Vibrations live synchronisées
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 flex flex-1 flex-col gap-5 pb-4">
              <ScrollArea className="h-[260px] pr-3">
                <div className="flex flex-col gap-4">
                  {activityFeed.map(activity => {
                    const user = collaborators.find(person => person.id === activity.userId);
                    return (
                      <div key={activity.id} className="group flex items-start gap-3 rounded-2xl border border-white/40 bg-white/50 p-4 backdrop-blur-xl transition hover:border-primary/40 hover:shadow-glow dark:border-white/10 dark:bg-white/5">
                        <div className={`relative h-10 w-10 rounded-2xl ${user?.accent ?? "bg-muted"}`}>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.avatar} alt={user?.name} className="object-cover" />
                            <AvatarFallback>{user?.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-green-400">
                            <span className="absolute inset-0 rounded-full bg-green-400/70 animate-ping" />
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            <span className="text-muted-foreground">{user?.name}</span> {activity.action}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                              {activity.boardName}
                            </Badge>
                            <Dot className="h-5 w-5 text-muted-foreground" />
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/60 px-5 py-4 backdrop-blur-xl text-sm text-muted-foreground shadow-inner dark:border-white/10 dark:bg-white/10">
                <div>
                  <p className="font-semibold text-foreground">Synchronisation continue</p>
                  <p>Glisser-déposer actif, commentaires instantanés et réactions live.</p>
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-white/30 bg-white/60 text-primary shadow-soft hover:border-primary/40 hover:text-primary dark:bg-white/5" onClick={() => toast.success("Mode atelier activé") }>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Filters */}
        <section className="glass-effect flex flex-col gap-5 rounded-3xl border-white/40 p-6 shadow-soft">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-2xl border border-white/20 bg-white/60 px-3 py-2 backdrop-blur-lg dark:bg-white/5">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  placeholder="Recherche raffinée"
                  className="h-9 flex-1 border-0 bg-transparent text-sm placeholder:text-muted-foreground focus-visible:ring-0"
                />
              </div>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="h-10 w-[210px] rounded-2xl border border-white/30 bg-white/60 text-sm font-medium backdrop-blur-lg transition hover:border-primary/40 dark:bg-white/10">
                  <SelectValue placeholder="Sélectionner une équipe" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-xl">
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <ToggleGroup type="single" value={viewMode} onValueChange={value => value && setViewMode(value as "grid" | "list")}>
                <ToggleGroupItem value="grid" className="h-10 w-10 rounded-2xl border border-white/30 bg-white/50 text-muted-foreground backdrop-blur-lg transition hover:border-primary/40 hover:text-primary data-[state=on]:border-primary/60 data-[state=on]:text-primary dark:bg-white/10">
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" className="h-10 w-10 rounded-2xl border border-white/30 bg-white/50 text-muted-foreground backdrop-blur-lg transition hover:border-primary/40 hover:text-primary data-[state=on]:border-primary/60 data-[state=on]:text-primary dark:bg-white/10">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
              <div className="flex items-center gap-2 rounded-full border border-white/30 bg-white/60 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground backdrop-blur-lg dark:bg-white/5">
                <Filter className="h-3.5 w-3.5" />
                {filteredBoards.length} résultats
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/30 bg-white/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur-lg dark:bg-white/5">
                Favoris
                <Switch checked={showFavoritesOnly} onCheckedChange={setShowFavoritesOnly} className="data-[state=checked]:bg-primary/70" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {trendingTags.map(tag => (
              <Button
                key={tag}
                variant="ghost"
                size="sm"
                onClick={() => toggleTagFilter(tag)}
                className={`rounded-full border border-white/30 bg-white/60 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-lg transition hover:border-primary/50 hover:text-primary dark:bg-white/5 ${selectedBoardTags.includes(tag) ? "border-primary/60 text-primary" : ""}`}
              >
                #{tag}
                {selectedBoardTags.includes(tag) && <Check className="ml-2 h-3 w-3" />}
              </Button>
            ))}
          </div>
        </section>

        {/* Boards */}
        <section className="flex flex-col gap-6">
          {filteredBoards.length === 0 ? (
            <div className="glass-effect flex flex-col items-center justify-center gap-4 rounded-3xl border-white/40 p-12 text-center shadow-soft">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Aucun tableau trouvé</h3>
                <p className="text-sm text-muted-foreground">Essayez d'ajuster vos filtres ou créez un nouveau tableau somptueux.</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setIsCreateDialogOpen(true)} className="rounded-full bg-primary/80 px-6 text-primary-foreground hover:bg-primary">Créer un tableau</Button>
                <Button variant="ghost" className="rounded-full border border-white/30 bg-white/60 px-6 backdrop-blur-lg hover:border-primary/40 hover:text-primary" onClick={() => setSelectedBoardTags([])}>
                  Réinitialiser
                </Button>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredBoards.map(board => {
                const boardCollaborators = board.collaboratorIds?.map(id => collaborators.find(person => person.id === id)).filter(Boolean) as Collaborator[];
                const team = teams.find(teamItem => teamItem.id === board.teamId);

                return (
                  <div
                    key={board.id}
                    draggable
                    onDragStart={() => handleDragStart(board.id)}
                    onDragOver={event => handleDragOver(event, board.id)}
                    onDragEnd={handleDragEnd}
                    className={`group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-white/30 bg-white/65 p-6 backdrop-blur-2xl shadow-soft transition duration-500 ease-in-out hover:-translate-y-1 hover:shadow-glow dark:border-white/10 dark:bg-white/10 ${draggingBoardId === board.id ? "ring-2 ring-primary/60" : ""}`}
                  >
                    <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100" style={{ backgroundImage: "linear-gradient(140deg, hsla(37,79%,75%,0.32), transparent 50%), radial-gradient(120% 120% at 0% 0%, hsla(150,32%,46%,0.25), transparent 55%)" }} />
                    <div className="relative z-10 flex flex-col gap-5">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            {team && (
                              <Badge className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-primary">
                                {team.name}
                              </Badge>
                            )}
                            {board.isLive && (
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold text-foreground">{board.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-3">{board.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleFavorite(board.id)}
                            className={`h-9 w-9 rounded-full border border-white/40 bg-white/60 text-muted-foreground backdrop-blur-lg transition hover:border-primary/40 hover:text-primary dark:bg-white/10 ${board.isFavorite ? "text-amber-500" : ""}`}
                          >
                            <Star className={`h-4 w-4 ${board.isFavorite ? "fill-current" : ""}`} />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-white/40 bg-white/60 text-muted-foreground backdrop-blur-lg transition hover:border-primary/40 hover:text-primary dark:bg-white/10">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-2xl border border-white/30 bg-white/70 backdrop-blur-2xl dark:bg-white/10">
                              <DropdownMenuLabel className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => handleOpenBoard(board.id)} className="cursor-pointer rounded-xl text-sm font-medium">
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Ouvrir
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleDuplicateBoard(board)} className="cursor-pointer rounded-xl text-sm font-medium">
                                <Copy className="mr-2 h-4 w-4" />
                                Dupliquer
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => { setEditingBoardId(board.id); }} className="cursor-pointer rounded-xl text-sm font-medium">
                                <Edit className="mr-2 h-4 w-4" />
                                Renommer / éditer
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleShareBoard(board)} className="cursor-pointer rounded-xl text-sm font-medium">
                                <Share2 className="mr-2 h-4 w-4" />
                                Partager
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => setBoardToDelete(board.id)} className="cursor-pointer rounded-xl text-sm font-medium text-red-500">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {(board.tags ?? []).map(tag => (
                          <Badge key={tag} className="rounded-full border border-white/40 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground backdrop-blur-lg transition group-hover:border-primary/40 group-hover:text-primary dark:bg-white/10">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/30 bg-white/50 px-4 py-3 text-xs text-muted-foreground backdrop-blur-lg shadow-inner dark:bg-white/5">
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-primary" />
                          <span>{boardCollaborators.length} collaborateur(s)</span>
                          <Dot className="h-5 w-5" />
                          <Clock className="h-4 w-4" />
                          <span>MàJ {board.lastModified.toLocaleDateString("fr-FR")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-3">
                            {boardCollaborators.slice(0, 3).map(person => (
                              <Avatar key={person.id} className="h-8 w-8 border border-white text-xs shadow-soft">
                                <AvatarImage src={person.avatar} alt={person.name} />
                                <AvatarFallback>{person.name.slice(0, 2)}</AvatarFallback>
                              </Avatar>
                            ))}
                            {boardCollaborators.length > 3 && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-white/50 bg-white/60 text-[11px] font-medium backdrop-blur-lg dark:bg-white/10">
                                +{boardCollaborators.length - 3}
                              </div>
                            )}
                          </div>
                          <Button size="sm" onClick={() => handleOpenBoard(board.id)} className="h-8 rounded-full bg-primary/80 px-4 text-xs font-semibold text-primary-foreground hover:bg-primary">
                            Ouvrir
                            <ArrowRight className="ml-1.5 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredBoards.map(board => {
                const boardCollaborators = board.collaboratorIds?.map(id => collaborators.find(person => person.id === id)).filter(Boolean) as Collaborator[];
                const team = teams.find(teamItem => teamItem.id === board.teamId);

                return (
                  <div
                    key={board.id}
                    draggable
                    onDragStart={() => handleDragStart(board.id)}
                    onDragOver={event => handleDragOver(event, board.id)}
                    onDragEnd={handleDragEnd}
                    className={`group flex flex-col gap-4 rounded-3xl border border-white/30 bg-white/60 p-6 backdrop-blur-2xl shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-glow dark:border-white/10 dark:bg-white/10 ${draggingBoardId === board.id ? "ring-2 ring-primary/60" : ""}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          {team && (
                            <Badge className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-primary">
                              {team.name}
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground">{board.elementsCount} éléments</span>
                          {board.isLive && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                              </span>
                              Live
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">{board.name}</h3>
                        <p className="max-w-2xl text-sm text-muted-foreground">{board.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleFavorite(board.id)}
                          className={`h-9 w-9 rounded-full border border-white/40 bg-white/60 text-muted-foreground backdrop-blur-lg transition hover:border-primary/40 hover:text-primary dark:bg-white/10 ${board.isFavorite ? "text-amber-500" : ""}`}
                        >
                          <Star className={`h-4 w-4 ${board.isFavorite ? "fill-current" : ""}`} />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-white/40 bg-white/60 text-muted-foreground backdrop-blur-lg transition hover:border-primary/40 hover:text-primary dark:bg-white/10">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-2xl border border-white/30 bg-white/70 backdrop-blur-2xl dark:bg-white/10">
                            <DropdownMenuLabel className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => handleOpenBoard(board.id)} className="cursor-pointer rounded-xl text-sm font-medium">
                              <ArrowRight className="mr-2 h-4 w-4" />
                              Ouvrir
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleDuplicateBoard(board)} className="cursor-pointer rounded-xl text-sm font-medium">
                              <Copy className="mr-2 h-4 w-4" />
                              Dupliquer
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => { setEditingBoardId(board.id); }} className="cursor-pointer rounded-xl text-sm font-medium">
                              <Edit className="mr-2 h-4 w-4" />
                              Renommer / éditer
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleShareBoard(board)} className="cursor-pointer rounded-xl text-sm font-medium">
                              <Share2 className="mr-2 h-4 w-4" />
                              Partager
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setBoardToDelete(board.id)} className="cursor-pointer rounded-xl text-sm font-medium text-red-500">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {(board.tags ?? []).map(tag => (
                          <Badge key={tag} className="rounded-full border border-white/40 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground backdrop-blur-lg transition group-hover:border-primary/40 group-hover:text-primary dark:bg-white/10">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                          {boardCollaborators.slice(0, 4).map(person => (
                            <Avatar key={person.id} className="h-8 w-8 border border-white text-xs shadow-soft">
                              <AvatarImage src={person.avatar} alt={person.name} />
                              <AvatarFallback>{person.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                          ))}
                          {boardCollaborators.length > 4 && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-white/50 bg-white/60 text-[11px] font-medium backdrop-blur-lg dark:bg-white/10">
                              +{boardCollaborators.length - 4}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 rounded-full border border-white/40 bg-white/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur-lg dark:bg-white/10">
                          <Clock className="h-3.5 w-3.5" /> {board.lastModified.toLocaleDateString("fr-FR")}
                        </div>
                        <Button size="sm" className="h-9 rounded-full bg-primary/80 px-5 text-xs font-semibold text-primary-foreground hover:bg-primary" onClick={() => handleOpenBoard(board.id)}>
                          Accéder
                          <ArrowRight className="ml-1.5 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Floating action button */}
      <div className="pointer-events-none fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        <div className="pointer-events-auto rounded-2xl border border-white/30 bg-white/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground backdrop-blur-lg shadow-soft dark:bg-white/10">
          Créer instantanément
        </div>
        <Button
          size="icon"
          onClick={() => setIsCreateDialogOpen(true)}
          className="pointer-events-auto h-14 w-14 rounded-full bg-primary/80 text-primary-foreground shadow-glow transition hover:scale-[1.03] hover:bg-primary"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Create board dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[520px] rounded-[28px] border border-white/30 bg-white/70 backdrop-blur-3xl dark:bg-white/10">
          <DialogHeader className="space-y-2">
            <Badge className="w-fit rounded-full border border-white/40 bg-white/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground backdrop-blur-lg dark:bg-white/5">
              Nouveau tableau
            </Badge>
            <DialogTitle className="text-2xl font-semibold text-foreground">Composer un espace ultra-premium</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Paramétrez un espace collaboratif immersif, invitez votre équipe et activez les micro-interactions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">Nom du tableau</Label>
              <Input
                value={newBoard.name}
                onChange={event => setNewBoard(prev => ({ ...prev, name: event.target.value }))}
                placeholder="Ex : Atelier expérience premium"
                className="h-11 rounded-2xl border border-white/40 bg-white/70 placeholder:text-muted-foreground backdrop-blur-lg focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">Description</Label>
              <Textarea
                value={newBoard.description}
                onChange={event => setNewBoard(prev => ({ ...prev, description: event.target.value }))}
                placeholder="Décrivez l'univers de ce tableau..."
                className="min-h-[100px] rounded-2xl border border-white/40 bg-white/70 placeholder:text-muted-foreground backdrop-blur-lg focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">Équipe</Label>
              <Select value={newBoard.teamId} onValueChange={value => setNewBoard(prev => ({ ...prev, teamId: value }))}>
                <SelectTrigger className="h-11 rounded-2xl border border-white/40 bg-white/70 text-sm font-medium backdrop-blur-lg focus:ring-0 focus:ring-offset-0 dark:bg-white/10">
                  <SelectValue placeholder="Choisir une équipe" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-xl">
                  {teams
                    .filter(team => team.id !== "all")
                    .map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-muted-foreground">Tags</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={tagInput}
                  onChange={event => setTagInput(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Ajoutez un tag (premium, focus, live...)"
                  className="h-10 flex-1 rounded-2xl border border-white/40 bg-white/70 placeholder:text-muted-foreground backdrop-blur-lg focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-white/10"
                />
                <Button type="button" className="h-10 rounded-2xl bg-primary/80 px-4 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground hover:bg-primary" onClick={handleAddTag}>
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newBoard.tags.map(tag => (
                  <Badge key={tag} className="flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-lg dark:bg-white/10">
                    #{tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="text-muted-foreground transition hover:text-red-500">
                      ×
                    </button>
                  </Badge>
                ))}
                {newBoard.tags.length === 0 && (
                  <p className="text-xs text-muted-foreground">Ajoutez des tags pour retrouver instantanément votre tableau.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button variant="ghost" className="h-11 w-full rounded-2xl border border-white/40 bg-white/70 text-sm font-semibold backdrop-blur-lg hover:border-primary/40 hover:text-primary dark:bg-white/10 sm:w-auto" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button className="h-11 w-full rounded-2xl bg-primary/80 px-6 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary hover:shadow-glow sm:w-auto" onClick={handleCreateBoard}>
              Créer le tableau
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create diagram dialog */}
      <Dialog open={isDiagramDialogOpen} onOpenChange={setIsDiagramDialogOpen}>
        <DialogContent className="max-w-[520px] rounded-[28px] border border-white/30 bg-white/70 backdrop-blur-3xl dark:bg-white/10">
          <DialogHeader className="space-y-2">
            <Badge className="w-fit rounded-full border border-white/40 bg-white/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground backdrop-blur-lg dark:bg-white/5">
              Nouveau diagramme
            </Badge>
            <DialogTitle className="text-2xl font-semibold text-foreground">Créer un flow immersif</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Définissez les sections, étapes et interactions pour orchestrer votre prochain atelier.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">Nom du diagramme</Label>
              <Input
                value={newBoard.name}
                onChange={event => setNewBoard(prev => ({ ...prev, name: event.target.value }))}
                placeholder="Ex : Parcours onboarding premium"
                className="h-11 rounded-2xl border border-white/40 bg-white/70 placeholder:text-muted-foreground backdrop-blur-lg focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">Description</Label>
              <Textarea
                value={newBoard.description}
                onChange={event => setNewBoard(prev => ({ ...prev, description: event.target.value }))}
                placeholder="Décrivez les interactions clés, transitions, micro-interactions..."
                className="min-h-[100px] rounded-2xl border border-white/40 bg-white/70 placeholder:text-muted-foreground backdrop-blur-lg focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">Équipe</Label>
              <Select value={newBoard.teamId} onValueChange={value => setNewBoard(prev => ({ ...prev, teamId: value }))}>
                <SelectTrigger className="h-11 rounded-2xl border border-white/40 bg-white/70 text-sm font-medium backdrop-blur-lg focus:ring-0 focus:ring-offset-0 dark:bg-white/10">
                  <SelectValue placeholder="Choisir une équipe" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-xl">
                  {teams
                    .filter(team => team.id !== "all")
                    .map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-muted-foreground">Tags</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={tagInput}
                  onChange={event => setTagInput(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Ajoutez un tag (diagramme, parcours, live...)"
                  className="h-10 flex-1 rounded-2xl border border-white/40 bg-white/70 placeholder:text-muted-foreground backdrop-blur-lg focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-white/10"
                />
                <Button type="button" className="h-10 rounded-2xl bg-primary/80 px-4 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground hover:bg-primary" onClick={handleAddTag}>
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newBoard.tags.map(tag => (
                  <Badge key={tag} className="flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-lg dark:bg-white/10">
                    #{tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="text-muted-foreground transition hover:text-red-500">
                      ×
                    </button>
                  </Badge>
                ))}
                {newBoard.tags.length === 0 && (
                  <p className="text-xs text-muted-foreground">Ajoutez des tags pour qualifier votre diagramme.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button variant="ghost" className="h-11 w-full rounded-2xl border border-white/40 bg-white/70 text-sm font-semibold backdrop-blur-lg hover:border-primary/40 hover:text-primary dark:bg-white/10 sm:w-auto" onClick={() => setIsDiagramDialogOpen(false)}>
              Annuler
            </Button>
            <Button className="h-11 w-full rounded-2xl bg-primary/80 px-6 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary hover:shadow-glow sm:w-auto" onClick={handleCreateDiagram}>
              Créer le diagramme
            </Button>
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
        <AlertDialogContent className="max-w-sm rounded-3xl border border-white/30 bg-white/70 backdrop-blur-3xl dark:bg-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">Supprimer ce tableau ?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Cette action est irréversible. Vous pourrez recréer un espace plus tard, mais toutes les données de ce tableau seront supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl border border-white/40 bg-white/70 px-4 py-2 text-sm font-medium backdrop-blur-lg hover:border-primary/40 hover:text-primary dark:bg-white/10">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBoard} className="rounded-2xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground shadow-soft transition hover:brightness-110">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
