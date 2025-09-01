// src/components/Navbar.tsx

import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import { reloadAuth, useAuthStore } from "@/stores/authStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import httpService from "../api/httpService";
import { toast } from "@/hooks/use-toast";

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
    { name: "Tournaments", href: "/tournaments" },
    { name: "Practice", href: "/practice" },
    { name: "Leaderboards", href: "/leaderboards" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        {/* Left Side: Logo & Main Nav */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#00A9FF] to-[#FF6B6B] flex items-center justify-center">
              <span className="text-white font-bold text-sm">IF</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">
              ItchyFingers
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-primary ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right Side: Theme Toggle & User Auth */}
        <div className="flex items-center gap-4">
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
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.username}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/auth/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/register">Sign up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="grid gap-6 text-lg font-medium mt-8">
                <Link
                  to="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#00A9FF] to-[#FF6B6B] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">IF</span>
                  </div>
                  <span>ItchyFingers</span>
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                ))}
                {!user && (
                  <div className="mt-4 flex flex-col gap-4">
                    <Button variant="ghost" asChild>
                      <Link to="/auth/login">Log in</Link>
                    </Button>
                    <Button asChild>
                      <Link to="/auth/register">Sign up</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
