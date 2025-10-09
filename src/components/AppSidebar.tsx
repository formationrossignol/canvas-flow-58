import { Home, Clock, Layout, Settings, Users, Search, Folder } from "lucide-react";
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
  },
  {
    id: "projet-2",
    name: "Projet 2",
    boardUrl: "/canvas/projet-2",
  },
  {
    id: "projet-3",
    name: "Projet 3",
    boardUrl: "/canvas/projet-3",
  },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarContent>
          {/* Header */}
          <div className="p-6 border-b border-sidebar-border">
            <h1 className={`font-bold text-2xl text-sidebar-foreground transition-opacity ${!open && 'opacity-0'}`}>
              CollabBoard
            </h1>
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

        {/* Projects navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="text-sm uppercase tracking-wider px-6 py-4 font-semibold">
            {open ? "Projets" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3 px-3">
              <SidebarMenuItem>
                <SidebarMenuButton className="px-5 py-4 rounded-xl" size="lg">
                  <Folder className="h-6 w-6 flex-shrink-0" />
                  {open && <span className="text-base font-semibold">Projets</span>}
                </SidebarMenuButton>
                {open && (
                  <div className="space-y-2 pt-2">
                    {projectTree.map((project) => {
                      const badgeLabel = project.name.split(" ").slice(-1)[0] ?? project.name.charAt(0);
                      return (
                        <div key={project.id} className="space-y-1">
                          <div className="flex items-center gap-2 px-3 text-sm font-semibold text-sidebar-foreground">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                              {badgeLabel}
                            </span>
                            <span>{project.name}</span>
                          </div>
                          <div className="pl-8">
                            <NavLink
                              to={project.boardUrl}
                              className={({ isActive }) =>
                                cn(
                                  "flex h-8 items-center gap-2 rounded-lg px-3 text-sm transition-colors",
                                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                  isActive && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                                )
                              }
                            >
                              <Layout className="h-4 w-4" />
                              <span>Tableau</span>
                            </NavLink>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SidebarMenuItem>

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
