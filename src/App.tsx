import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "./hooks/useTheme";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Tournament from "./pages/Tournament";
import TournamentLobby from "./pages/TournamentLobby";
import NotFound from "./pages/NotFound";
import PasswordRecovery from "./pages/PasswordRecovery";

const queryClient = new QueryClient();

const App = () => {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground transition-colors">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/password-recovery" element={<PasswordRecovery />} />
              <Route path="/tournaments" element={<TournamentLobby />} />
              <Route path="/tournament/:id" element={<Tournament />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
