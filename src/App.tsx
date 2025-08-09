import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "./hooks/useTheme";
import Index from "./pages/Index";
import AuthLayout from "./components/AuthLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PasswordRecovery from "./pages/PasswordRecovery";
import Tournament from "./pages/Tournament";
import TournamentLobby from "./pages/TournamentLobby";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./hooks/useAuth";
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient();

const App = () => {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground transition-colors">
            <Toaster />
            <Sonner />
            <AuthProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<AuthLayout />}>
                    {" "}
                    {/* unified auth layout */}
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route
                      path="password-recovery"
                      element={<PasswordRecovery />}
                    />
                  </Route>
                  <Route path="/tournaments" element={<TournamentLobby />} />
                  <Route
                    path="/tournaments/:tournamentId"
                    element={<Tournament />}
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </AuthProvider>
          </div>
        </TooltipProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
