import { Home, Clock, Layout, Settings, Users, Search, MoreHorizontal } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar, SidebarContent, useSidebar,
} from "@/components/ui/sidebar";
import { SearchDialog } from "@/components/SearchDialog";
import { useBranding } from "@/contexts/BrandingContext";

const navLinks = [
  { title: "Mes tableaux", url: "/", icon: Home },
  { title: "Récents", url: "/recent", icon: Clock },
  { title: "Templates", url: "/templates", icon: Layout },
  { title: "Équipes", url: "/teams", icon: Users },
];

const boards = [
  { id: "sprint-q2-design", name: "Sprint Q2 — Design", url: "/canvas/sprint-q2-design", color: "#6366F1", isFav: true },
  { id: "workshop-produit", name: "Workshop Produit", url: "/canvas/workshop-produit", color: "#10B981", isFav: false },
  { id: "roadmap-2025", name: "Roadmap 2025", url: "/canvas/roadmap-2025", color: "#F59E0B", isFav: true },
  { id: "retro-sprint-12", name: "Rétro Sprint 12", url: "/canvas/retro-sprint-12", color: "#8B5CF6", isFav: false },
];

const activities = [
  { id: 1, initial: "J", color: "#10B981", name: "Jean-Paul R.", text: "a rejoint le tableau", time: "7m" },
  { id: 2, initial: "S", color: "#6366F1", name: "Sophie M.", text: "a ajouté 3 post-its", time: "5m" },
  { id: 3, initial: "T", color: "#F59E0B", name: "Thomas B.", text: 'a voté sur "Mode hors..."', time: "3m" },
];

const NAV_BTN = (active: boolean, open: boolean): React.CSSProperties => ({
  display: "flex", alignItems: "center",
  gap: open ? 10 : 0,
  padding: "8px 10px", borderRadius: 8, cursor: "pointer",
  border: "none", width: "100%", fontFamily: "inherit",
  justifyContent: open ? "flex-start" : "center",
  minHeight: 36, fontSize: 13.5, fontWeight: 500,
  transition: "background 0.12s",
  background: active ? "rgba(99,102,241,0.12)" : "transparent",
  color: active ? "#A5B4FC" : "rgba(255,255,255,0.5)",
  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  textDecoration: "none",
});

const BOARD_BTN = (active: boolean, open: boolean): React.CSSProperties => ({
  display: "flex", alignItems: "center",
  gap: open ? 8 : 0,
  padding: "7px 10px", borderRadius: 8, cursor: "pointer",
  border: "none", width: "100%", fontFamily: "inherit",
  justifyContent: open ? "flex-start" : "center",
  minHeight: 34, fontSize: 13.5, fontWeight: 500,
  transition: "background 0.12s",
  background: active ? "rgba(99,102,241,0.1)" : "transparent",
  color: active ? "#A5B4FC" : "rgba(255,255,255,0.44)",
  whiteSpace: "nowrap", overflow: "hidden", textDecoration: "none",
});

export function AppSidebar() {
  const { open } = useSidebar();
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const { logoUrl, brandName } = useBranding();

  const displayBrandName = brandName.trim().length > 0 ? brandName : "FlowBoard";
  const brandInitials = displayBrandName
    .split(/\s+/).filter(Boolean)
    .map(w => w[0]?.toUpperCase()).join("").slice(0, 2) || "FB";

  return (
    <>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      <Sidebar
        collapsible="icon"
        style={{ background: "#0F1117", borderRight: "1px solid rgba(255,255,255,0.06)" }}
        className="z-50"
      >
        <SidebarContent style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

          {/* Logo header */}
          <div style={{ height: 52, display: "flex", alignItems: "center", gap: 10, padding: "0 14px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0, overflow: "hidden" }}>
            <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#6366F1 0%,#8B5CF6 100%)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(99,102,241,0.35)" }}>
              {logoUrl
                ? <img src={logoUrl} alt={displayBrandName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                : <span style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{brandInitials}</span>
              }
            </div>
            {open && (
              <span style={{ fontSize: 15, fontWeight: 700, color: "#F1F3F5", letterSpacing: -0.4, whiteSpace: "nowrap", overflow: "hidden" }}>
                {displayBrandName}
              </span>
            )}
          </div>

          {/* Search */}
          {open && (
            <div style={{ padding: 10, borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
              <button
                onClick={() => setSearchOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "7px 10px", cursor: "text", width: "100%", fontFamily: "inherit" }}
              >
                <Search size={14} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.27)", flex: 1, lineHeight: 1, textAlign: "left" }}>Rechercher...</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.07)", padding: "2px 6px", borderRadius: 4, letterSpacing: "0.02em", flexShrink: 0 }}>⌘K</span>
              </button>
            </div>
          )}

          {/* Nav */}
          <nav style={{ flex: 1, padding: 8, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", gap: 2 }}>
            {/* NAVIGATION section */}
            {open && (
              <div style={{ padding: "8px 8px 4px", fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,0.22)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Navigation
              </div>
            )}
            {navLinks.map(item => {
              const isActive = location.pathname === item.url || (item.url !== "/" && location.pathname.startsWith(item.url));
              return (
                <NavLink key={item.title} to={item.url} style={NAV_BTN(isActive, open)}>
                  <item.icon size={16} style={{ flexShrink: 0 }} />
                  {open && <span>{item.title}</span>}
                </NavLink>
              );
            })}

            {/* Separator */}
            <div style={{ margin: "8px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }} />

            {/* TABLEAUX section */}
            {open && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px 4px" }}>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,0.22)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Tableaux</span>
                <button style={{ width: 18, height: 18, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 4, cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>+</button>
              </div>
            )}
            {boards.map(board => {
              const isActive = location.pathname === board.url;
              return (
                <NavLink key={board.id} to={board.url} style={BOARD_BTN(isActive, open)}>
                  <div style={{ width: 6, height: 6, borderRadius: 2, background: board.color, flexShrink: 0 }} />
                  {open && (
                    <>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", textAlign: "left" }}>{board.name}</span>
                      {board.isFav && <span style={{ color: "#F59E0B", fontSize: 10, flexShrink: 0 }}>★</span>}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Activity feed */}
          {open && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "8px 10px 4px", flexShrink: 0, maxHeight: 140, overflowY: "auto" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.22)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Activité</div>
              {activities.map(act => (
                <div key={act.id} style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "3px 0" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: act.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white", flexShrink: 0 }}>
                    {act.initial}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.45, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span style={{ fontWeight: 600 }}>{act.name}</span> {act.text}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 1 }}>{act.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* User profile */}
          <div style={{ padding: "10px 8px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 6, borderRadius: 9 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>
                M
              </div>
              {open && (
                <>
                  <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#E2E4EA", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.3 }}>Marie Dupont</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.27)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Pro · Équipe Design</div>
                  </div>
                  <button style={{ width: 22, height: 22, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, flexShrink: 0 }}>
                    <MoreHorizontal size={14} />
                  </button>
                </>
              )}
            </div>
          </div>

        </SidebarContent>
      </Sidebar>
    </>
  );
}
