import { Home, Clock, Layout, Settings, Users, Search } from "lucide-react";
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

const menuItems = [
  { title: "Mes tableaux", url: "/", icon: Home },
  { title: "Récents", url: "/recent", icon: Clock },
  { title: "Templates", url: "/templates", icon: Layout },
  { title: "Équipes", url: "/teams", icon: Users },
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

        {/* Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="text-sm uppercase tracking-wider px-6 py-4 font-semibold"></SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3 px-3">
              {menuItems.map((item) => (
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
                            ? "bg-gradient-primary text-white shadow-glow font-semibold scale-[1.02]" 
                            : "text-sidebar-foreground hover:bg-gradient-primary hover:text-white hover:shadow-glow hover:scale-[1.02] font-medium"
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
