import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import apiService from "@/api/apiService";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { HttpResponse, TournamentSchema } from "@/types/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { DateTime } from "luxon";
import { Loader } from "lucide-react";

type CreateTournamentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSuccess: (tournamentId: string) => void;
};

export function CreateTournamentDialog({ open, onOpenChange, onCreateSuccess }: CreateTournamentDialogProps) {
  const { isAuthenticated } = useAuthStore();
  const [title, setTitle] = useState("");
  // Prefill with now + 5 minutes, formatted for datetime-local
  const defaultScheduledFor = DateTime.now().plus({ minutes: 5 }).toFormat("yyyy-MM-dd'T'HH:mm");
  const [scheduledFor, setScheduledFor] = useState(defaultScheduledFor);
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
    // Validate that scheduledFor is a valid future datetime
    const scheduledDate = DateTime.fromFormat(scheduledFor, "yyyy-MM-dd'T'HH:mm");
    if (!scheduledDate.isValid || scheduledDate < DateTime.now().plus({ minutes: 1 })) {
      setError("Scheduled time must be at least 1 minute from now and valid.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await apiService.post<HttpResponse<TournamentSchema>>("/tournaments", {
        title,
        scheduled_for: scheduledDate.toISO(),
        includeSpecialChars,
        includeUppercase,
      });
      if (response.data.success) {
        toast({
          title: "Tournament Created",
          description: "Your tournament has been created successfully.",
        });
        onOpenChange(false);
        onCreateSuccess(response.data.data.id);
        console.log("Tournament created:", response.data.data.id);
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
                min={defaultScheduledFor}
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
                {isLoading ? <Loader className="animate-spin" /> : "Create Tournament"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
