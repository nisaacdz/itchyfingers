"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, EyeClosed, Eye, Lock, Loader } from "lucide-react";
import Link from "next/link";
import { loginUser } from "@/api/requests";
import { toast } from "sonner";
import { useAuth } from "@/hooks/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { client, reload } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  useEffect(() => {
    if (client?.user) {
      let returnTo = window.sessionStorage.getItem("returnTo");
      if (!returnTo || returnTo === "/login") {
        returnTo = "/";
      }
      router.push(returnTo);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const response = await loginUser({
      email: formData.email,
      password: formData.password,
    });

    if (response.error || !response.result) {
      toast.error(response.error || "Could not sign in");
    } else {
      toast.success("Signed in successfully");
      reload();
    }
    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <Card className="w-full max-w-md bg-background shadow-lg transition-all hover:shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center text-foreground">
          Welcome Back
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="text"
                placeholder="adjoamensah"
                className="pl-10 bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeClosed className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={formData.remember}
                onChange={handleInputChange}
                className="w-4 h-4 accent-primary rounded border-muted-foreground"
              />
              <Label htmlFor="remember" className="text-muted-foreground">
                Remember me
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader className="animate-spin" /> : "Sign In"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {`Don't have an account? `}
            <Link
              href="./signup"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
