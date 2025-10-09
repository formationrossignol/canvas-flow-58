import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LayoutGrid, FileText, X, UserCog } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SearchResultType = "board" | "template" | "page";

interface SearchResult {
  id: number;
  name: string;
  type: SearchResultType;
  tags: string[];
  url?: string;
  description?: string;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "boards" | "templates">("all");
  const navigate = useNavigate();

  // Mock data - remplacer par de vraies données plus tard
  const mockResults: SearchResult[] = useMemo(
    () => [
      { id: 1, name: "Projet Marketing Q1", type: "board", tags: ["Marketing", "2024"] },
      { id: 2, name: "Wireframe Dashboard", type: "template", tags: ["UI", "Design"] },
      { id: 3, name: "Sprint Planning", type: "board", tags: ["Agile", "Dev"] },
      { id: 4, name: "User Flow Template", type: "template", tags: ["UX", "Flow"] },
      {
        id: 5,
        name: "Gestion des utilisateurs",
        type: "page",
        tags: ["Administration", "Rôles"],
        url: "/users",
        description: "Attribuer des rôles et suivre les squads de chaque collaborateur",
      },
    ],
    [],
  );

  const filteredResults = useMemo(
    () =>
      mockResults.filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = filterType === "all" || item.type === filterType;
        return matchesSearch && matchesType;
      }),
    [mockResults, searchQuery, filterType],
  );

  const handleSelect = (result: SearchResult) => {
    if (result.url) {
      navigate(result.url);
      onOpenChange(false);
    }
  };

  const renderTypeBadge = (type: SearchResultType) => {
    switch (type) {
      case "board":
        return "Tableau";
      case "template":
        return "Template";
      case "page":
        return "Section";
      default:
        return type;
    }
  };

  const renderTypeIcon = (type: SearchResultType) => {
    switch (type) {
      case "board":
        return <LayoutGrid className="h-5 w-5 text-primary" />;
      case "template":
        return <FileText className="h-5 w-5 text-secondary" />;
      case "page":
        return <UserCog className="h-5 w-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">Rechercher</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher des tableaux, templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
              autoFocus
            />
          </div>

          {/* Filtres par type */}
          <div className="flex gap-2">
            <Badge
              variant={filterType === "all" ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/20 transition-colors px-4 py-2 text-sm"
              onClick={() => setFilterType("all")}
            >
              Tous
            </Badge>
            <Badge
              variant={filterType === "boards" ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/20 transition-colors px-4 py-2 text-sm gap-1.5"
              onClick={() => setFilterType("boards")}
            >
              <LayoutGrid className="h-4 w-4" />
              Tableaux
            </Badge>
            <Badge
              variant={filterType === "templates" ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/20 transition-colors px-4 py-2 text-sm gap-1.5"
              onClick={() => setFilterType("templates")}
            >
              <FileText className="h-4 w-4" />
              Templates
            </Badge>
          </div>
        </div>

        {/* Résultats */}
        <ScrollArea className="max-h-96 px-6 pb-6">
          <div className="space-y-2">
            {filteredResults.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Aucun résultat trouvé
              </div>
            ) : (
              filteredResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer group"
                  onClick={() => handleSelect(result)}
                >
                  <div className="flex items-center gap-3">
                    {renderTypeIcon(result.type)}
                    <div>
                      <p className="font-medium">{result.name}</p>
                      {result.description && (
                        <p className="text-sm text-muted-foreground">{result.description}</p>
                      )}
                      <div className="flex gap-1 mt-1">
                        {result.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Badge variant={result.type === "page" ? "secondary" : result.type === "board" ? "default" : "secondary"}>
                    {renderTypeBadge(result.type)}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
