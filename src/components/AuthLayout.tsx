// src/components/AuthLayout.tsx

import { Link, Outlet } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { Chrome } from "lucide-react";
import { Card } from "@/components/ui/card";
import { httpService } from "../api/httpService";
import { LoginSchema } from "@/types/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const AuthLayout = () => {
  const { setUser } = useAuth();
  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      console.log("Google login success:", codeResponse);
      try {
        const response = await httpService.post<LoginSchema>("/auth/google", {
          code: codeResponse.code,
        });

        if (response.data.success) {
          toast.success("Google login successful!");
          setUser(response.data.data?.user ?? null);
        } else {
          toast.error(response.data.message || "Google login failed");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Google login failed"
        );
      }
    },
    onError: () => {
      console.error("Google login failed");
    },
    flow: "auth-code",
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#00A9FF] to-[#FF6B6B] shadow-md">
              <span className="text-xl font-bold text-white">IF</span>
            </div>
          </Link>
        </div>
        <Card>
          <Outlet />
        </Card>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <button
          onClick={() => login()}
          className="w-full flex items-center justify-center px-4 py-2.5 
                     border rounded-md shadow-sm 
                     bg-card text-card-foreground 
                     hover:bg-accent hover:text-accent-foreground 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring
                     transition-colors duration-200"
        >
          <Chrome className="mr-3 h-5 w-5" strokeWidth={2} />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default AuthLayout;
