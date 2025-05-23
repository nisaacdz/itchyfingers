"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Loader } from "lucide-react";
import { updateUsername } from "@/api/requests";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/custom/PageLoader";

type Username = {
  username: string;
};

export default function UsernamePage() {
  const router = useRouter();
  const { client, reload, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [formData, setFormData] = useState<Username | null>(null);

  useEffect(() => {
    if (!client?.user) {
      reload();
    }
  }, [client?.user, reload]);

  if (loading || redirecting) {
    return <PageLoader />;
  }

  if (!client?.user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client.user || !formData) return;
    setIsSubmitting(true);
    const response = await updateUsername(formData.username);

    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success("Username updated successfully");
      setRedirecting(true); // forever shows redirect until redirect completes
      await reload();
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
    const value = e.target.value;
    setFormData(() => ({
      username: value,
    }));
  };

  const username = formData == null ? client.user.username : formData.username;

  return (
    <Card className="w-96 bg-background shadow-lg transition-all hover:shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center text-foreground">
          Choose Your Username
        </CardTitle>
        <CardTitle className="text-sm text-center text-muted-foreground">
          This will be displayed on your profile and in competitions
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
                value={username}
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
  );
}
