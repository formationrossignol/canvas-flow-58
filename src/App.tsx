import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider, useTheme } from "next-themes";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { PageHeaderProvider, usePageHeader } from "@/contexts/PageHeaderContext";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Recent from "./pages/Recent";
import Templates from "./pages/Templates";
import Settings from "./pages/Settings";
import Teams from "./pages/Teams";
import Canvas from "./pages/Canvas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const DashboardHeaderBar = () => {
  const { title, action } = usePageHeader();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header style={{
      height: 52, display: 'flex', alignItems: 'center',
      borderBottom: '1px solid #E5E7EB', padding: '0 16px', gap: 12,
      flexShrink: 0, background: 'white',
    }}>
      <SidebarTrigger />
      {title && (
        <span style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', letterSpacing: -0.2, whiteSpace: 'nowrap' }}>
          {title}
        </span>
      )}
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {isDark ? <Moon size={14} style={{ color: '#64748B' }} /> : <Sun size={14} style={{ color: '#64748B' }} />}
        <Switch
          checked={isDark}
          onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
          className="data-[state=checked]:bg-primary/70 h-5 w-9"
        />
      </div>
      {action && <div style={{ display: 'flex', alignItems: 'center' }}>{action}</div>}
    </header>
  );
};

const DashboardLayout = () => (
  <PageHeaderProvider>
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeaderBar />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  </PageHeaderProvider>
);

const App = () => {
  const rawBaseUrl = import.meta.env.BASE_URL ?? "/";
  const normalizedBaseUrl = rawBaseUrl === "./" ? "/" : rawBaseUrl;
  const basename =
    normalizedBaseUrl.endsWith("/") && normalizedBaseUrl !== "/"
      ? normalizedBaseUrl.slice(0, -1)
      : normalizedBaseUrl || "/";

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <BrandingProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename={basename}>
              <Routes>
                <Route path="/" element={<DashboardLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="recent" element={<Recent />} />
                  <Route path="templates" element={<Templates />} />
                  <Route path="teams" element={<Teams />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                <Route path="/canvas/:id" element={<Canvas />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </BrandingProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
