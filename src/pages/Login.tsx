import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import httpService from "../api/httpService";
import { LoginSchema } from "../types/api";
import { Loader, Eye, EyeOff } from "lucide-react";
import { AxiosError } from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await httpService.post<LoginSchema>("/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });

        setUser(response.data.data?.user ?? null);

        const returnTo = sessionStorage.getItem("returnTo");
        sessionStorage.removeItem("returnTo");
        navigate(returnTo || "/");
      } else {
        setError(
          response.data.message ||
            "Login failed. Please check your credentials.",
        );
      }
    } catch (err) {
      const errorMessage =
        (err instanceof AxiosError && err?.response?.data?.message) ||
        "An error occurred during login";
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end text-sm">
            <Link
              to="/auth/password-recovery"
              className="font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader className="animate-spin" /> : "Sign in"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/auth/register"
              className="font-semibold text-primary hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </>
  );
}
