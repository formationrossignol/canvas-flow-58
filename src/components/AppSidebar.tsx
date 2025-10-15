import { Home, Clock, Layout, Settings, Users, Search, Folder, Star } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SearchDialog } from "@/components/SearchDialog";
import { cn } from "@/lib/utils";
import { useBranding } from "@/contexts/BrandingContext";

const quickLinks = [
  { title: "Mes tableaux", url: "/", icon: Home },
  { title: "Récents", url: "/recent", icon: Clock },
  { title: "Templates", url: "/templates", icon: Layout },
  { title: "Équipes", url: "/teams", icon: Users },
];

const projectTree = [
  {
    id: "projet-1",
    name: "Projet 1",
    boardUrl: "/canvas/projet-1",
    teamId: "team1",
    isFavorite: true,
  },
  {
    id: "projet-2",
    name: "Projet 2",
    boardUrl: "/canvas/projet-2",
    teamId: "team2",
    isFavorite: false,
  },
  {
    id: "projet-3",
    name: "Projet 3",
    boardUrl: "/canvas/projet-3",
    teamId: "team1",
    isFavorite: true,
  },
];

const teams = [
  { id: "team1", name: "Équipe Marketing" },
  { id: "team2", name: "Équipe Dev" },
  { id: "team3", name: "Projets Perso" }
];

export function AppSidebar() {
  const { open } = useSidebar();
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>("team1");
  const { logoUrl, brandName } = useBranding();
  const displayBrandName = brandName.trim().length > 0 ? brandName : "CollabBoard";
  const brandInitials = displayBrandName
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase())
    .join("")
    .slice(0, 2) || "CB";

  return (
    <>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarContent>
          {/* Header */}
          <div className="p-6 border-b border-sidebar-border">
            <NavLink
              to="/"
              className={cn(
                "group flex items-center gap-3 rounded-xl px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-background",
                !open && "justify-center"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-sidebar-border bg-sidebar-accent/60",
                  logoUrl && "bg-white/60"
                )}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt={`${displayBrandName} logo`} className="h-full w-full object-contain" />
                ) : (
                  <span className="text-lg font-semibold text-sidebar-foreground">{brandInitials}</span>
                )}
              </div>
              {open && (
                <span className="text-2xl font-bold text-sidebar-foreground">
                  {displayBrandName}
                </span>
              )}
            </NavLink>
          </div>

          {/* Search Button */}
          {open && (
            <div className="p-4 border-b border-sidebar-border">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 text-base bg-sidebar-accent/30 hover:bg-sidebar-accent border-sidebar-border"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
                <span className="text-muted-foreground">Rechercher...</span>
              </Button>
            </div>
          )}

        {/* Team selector and favorites */}
        {open && (
          <div className="px-6 py-4 border-b border-sidebar-border space-y-3">
            <label className="text-sm font-semibold text-sidebar-foreground">Équipe</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-sidebar-accent border border-sidebar-border text-sidebar-foreground text-sm"
            >
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Favorites Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm uppercase tracking-wider px-6 py-4 font-semibold">
            {open ? "Favoris" : "★"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-3">
              {projectTree
                .filter(p => p.isFavorite && p.teamId === selectedTeam)
                .map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={project.boardUrl}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 ${
                            isActive 
                              ? "bg-gradient-primary font-semibold scale-[1.02]" 
                              : "text-sidebar-foreground font-medium hover:bg-sidebar-accent"
                          }`
                        }
                      >
                        <Star className="h-5 w-5 flex-shrink-0 fill-current" />
                        {open && <span className="text-base">{project.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="text-sm uppercase tracking-wider px-6 py-4 font-semibold">
            {open ? "Tous les tableaux" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-3">
              {projectTree
                .filter(p => p.teamId === selectedTeam)
                .map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={project.boardUrl}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 ${
                            isActive 
                              ? "bg-gradient-primary font-semibold scale-[1.02]" 
                              : "text-sidebar-foreground font-medium hover:bg-sidebar-accent"
                          }`
                        }
                      >
                        <Layout className="h-5 w-5 flex-shrink-0" />
                        {open && <span className="text-base">{project.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

              <div className="h-px bg-sidebar-border" />

              {quickLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? "bg-gradient-primary font-semibold scale-[1.02]" 
                            : "text-sidebar-foreground font-medium"
                        }`
                      }
                    >
                      <item.icon className="h-6 w-6 flex-shrink-0" />
                      {open && <span className="text-base">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings at bottom */}
        <div className="border-t border-sidebar-border mt-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="px-3 py-3">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/settings"
                      className={({ isActive }) => 
                        `flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? "bg-gradient-primary font-semibold scale-[1.02]" 
                            : "text-sidebar-foreground font-medium"
                        }`
                      }
                    >
                      <Settings className="h-6 w-6 flex-shrink-0" />
                      {open && <span className="text-base">Paramètres</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

      </SidebarContent>
    </Sidebar>
    </>
  );
}
