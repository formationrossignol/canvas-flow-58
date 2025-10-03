import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Recent from "./pages/Recent";
import Templates from "./pages/Templates";
import Settings from "./pages/Settings";
import Teams from "./pages/Teams";
import Canvas from "./pages/Canvas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const DashboardLayout = () => (
  <SidebarProvider defaultOpen={false}>
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 flex items-center border-b border-border px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
  </QueryClientProvider>
);

export default App;
