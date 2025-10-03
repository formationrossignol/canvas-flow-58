import { Home, Clock, Layout, Settings, Users, Search, LayoutGrid, FileText } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { title: "Mes tableaux", url: "/", icon: Home },
  { title: "Récents", url: "/recent", icon: Clock },
  { title: "Templates", url: "/templates", icon: Layout },
  { title: "Équipes", url: "/teams", icon: Users },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "boards" | "templates">("all");

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <h1 className={`font-bold text-xl text-sidebar-foreground transition-opacity ${!open && 'opacity-0'}`}>
            CollabBoard
          </h1>
        </div>

        {/* Search Section */}
        {open && (
          <div className="p-4 space-y-3 border-b border-sidebar-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-sidebar-accent/30 border-sidebar-border focus:bg-sidebar-accent"
              />
            </div>
            
            {/* Filter by type */}
            <div className="flex gap-2">
              <Badge
                variant={filterType === "all" ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/20 transition-colors px-3 py-1"
                onClick={() => setFilterType("all")}
              >
                Tous
              </Badge>
              <Badge
                variant={filterType === "boards" ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/20 transition-colors px-3 py-1 gap-1"
                onClick={() => setFilterType("boards")}
              >
                <LayoutGrid className="h-3 w-3" />
                Tableaux
              </Badge>
              <Badge
                variant={filterType === "templates" ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/20 transition-colors px-3 py-1 gap-1"
                onClick={() => setFilterType("templates")}
              >
                <FileText className="h-3 w-3" />
                Templates
              </Badge>
            </div>
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="text-xs uppercase tracking-wider px-4 py-3">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? "bg-gradient-primary text-white shadow-glow font-medium" 
                            : "hover:bg-sidebar-accent/70 hover:shadow-soft hover:scale-[1.02]"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {open && <span className="text-sm">{item.title}</span>}
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
              <SidebarMenu className="px-2 py-2">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/settings"
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? "bg-gradient-primary text-white shadow-glow font-medium" 
                            : "hover:bg-sidebar-accent/70 hover:shadow-soft hover:scale-[1.02]"
                        }`
                      }
                    >
                      <Settings className="h-5 w-5" />
                      {open && <span className="text-sm">Paramètres</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

      </SidebarContent>
    </Sidebar>
  );
}
