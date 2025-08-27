import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { reloadAuth, useAuthStore } from "@/stores/authStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import httpService from "../api/httpService";
import { toast } from "@/hooks/use-toast";
import { FloatingNav } from "@/components/ui/floating-navbar"; // <-- Import Aceternity Component

export function Navbar() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    httpService.clearTokens();
    await reloadAuth();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate("/");
  };

  const navItems = [
    {
      name: "Tournaments",
      link: "/tournaments",
    },
    // Add other links here if you have them, e.g., "Leaderboards", "Profile"
  ];

  return (
    <>
      {/* This FloatingNav will appear on scroll */}
      <FloatingNav navItems={navItems} className="hidden md:flex" />

      {/* This is the permanent, static top bar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#00A9FF] to-[#FF6B6B] flex items-center justify-center">
                <span className="text-white font-bold text-sm">IF</span>
              </div>
              <span className="font-bold text-xl">ItchyFingers</span>
            </Link>

            {/* Main nav links moved to FloatingNav, but you can keep them here for mobile */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/tournaments">
                <Button variant="ghost">Tournaments</Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-background border z-50"
                  align="end"
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.username}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/auth/register">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
