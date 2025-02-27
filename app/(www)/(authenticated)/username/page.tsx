"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Loader } from "lucide-react";
import { updateUsername } from "@/api/requests";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

export default function UsernamePage() {
  console.log("UsernamePage");
  const router = useRouter();
  const { user, reload, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
  });

  if (loading) {
    return <span className="dots-loader">Loading</span>;
  }

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const response = await updateUsername(user, formData.username);

    if (response.error || !response.result) {
      toast.error(response.error || "Could not update username");
    } else {
      toast.success("Username updated successfully");
      reload();
      const returnTo = window.sessionStorage.getItem("returnTo") || "/";
      router.push(returnTo);
    }
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    const returnTo = window.sessionStorage.getItem("returnTo") || "/";
    router.push(returnTo);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-96 bg-background shadow-lg transition-all hover:shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-foreground">
            Choose Your Username
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">
                Username
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="adjoamensah"
                  className="pl-10 bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary"
                  value={formData.username || user.username}
                  onChange={handleInputChange}
                  required
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-4">
              <Button
                type="button"
                onClick={handleCancel}
                className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                disabled={isSubmitting}
              >
                Skip for now
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader className="animate-spin" /> : "Update"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
