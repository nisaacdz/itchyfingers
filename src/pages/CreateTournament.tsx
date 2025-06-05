import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import apiService from "@/api/apiService";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { HttpResponse } from "@/types/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { DateTime } from "luxon";

export default function CreateTournament() {
  const { isAuthenticated } = useAuthStore();
  const [title, setTitle] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    if (!title.trim() || !scheduledFor) {
      setError("Title and scheduled time are required.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await apiService.post<HttpResponse<{ tournamentId: string }>>("/tournaments", {
        title,
        scheduled_for: scheduledFor,
      });
      if (response.data.success) {
        toast({
          title: "Tournament Created",
          description: "Your tournament has been created successfully.",
        });
        navigate("/tournament-lobby");
      } else {
        setError(response.data.message || "Failed to create tournament.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not Authorized</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You must be logged in to create a tournament.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Tournament</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Tournament Title"
              />
            </div>
            <div>
              <Label htmlFor="scheduledFor">Scheduled For</Label>
              <Input
                id="scheduledFor"
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && <div className="text-destructive text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Tournament"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function CreateTournamentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { isAuthenticated } = useAuthStore();
  const [title, setTitle] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [includeSpecialChars, setIncludeSpecialChars] = useState(false);
  const [includeUppercase, setIncludeUppercase] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    if (!title.trim() || !scheduledFor) {
      setError("Title and scheduled time are required.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await apiService.post<HttpResponse<{ tournamentId: string }>>("/tournaments", {
        title,
        scheduled_for: scheduledFor,
        includeSpecialChars,
        includeUppercase,
      });
      if (response.data.success) {
        toast({
          title: "Tournament Created",
          description: "Your tournament has been created successfully.",
        });
        onOpenChange(false);
        navigate("/tournament-lobby");
      } else {
        setError(response.data.message || "Failed to create tournament.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Tournament</DialogTitle>
        </DialogHeader>
        {!isAuthenticated ? (
          <div className="text-center py-8">You must be logged in to create a tournament.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Tournament Title"
              />
            </div>
            <div>
              <Label htmlFor="scheduledFor">Scheduled For</Label>
              <Input
                id="scheduledFor"
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label>Text Options</Label>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="specialChars" checked={includeSpecialChars} onCheckedChange={checked => setIncludeSpecialChars(!!checked)} />
                  <Label htmlFor="specialChars">Special Characters</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="uppercase" checked={includeUppercase} onCheckedChange={checked => setIncludeUppercase(!!checked)} />
                  <Label htmlFor="uppercase">Uppercase Letters</Label>
                </div>
              </div>
            </div>
            {error && <div className="text-destructive text-sm">{error}</div>}
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Tournament"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
