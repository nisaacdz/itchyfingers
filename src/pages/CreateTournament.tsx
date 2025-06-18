import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import httpService from "@/api/httpService";
import { toast } from "@/hooks/use-toast";
import { CreatedTournament, HttpResponse, TextOptions, Tournament } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { DateTime } from "luxon";
import { Loader } from "lucide-react";

type CreateTournamentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSuccess: (tournamentId: string) => void;
};

export function CreateTournamentDialog({
  open,
  onOpenChange,
  onCreateSuccess,
}: CreateTournamentDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const defaultScheduledFor = DateTime.now()
    .plus({ minutes: 15 })
    .toFormat("yyyy-MM-dd'T'HH:mm");
  const [scheduledFor, setScheduledFor] = useState(defaultScheduledFor);
  // textOptions is null by default (no customization)
  const [textOptions, setTextOptions] = useState<TextOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Default values for customization
  const defaultTextOptions: TextOptions = {
    uppercase: false,
    lowercase: true,
    numbers: false,
    symbols: false,
    meaningful: true,
  };

  const handleTextOptionChange = (key: keyof TextOptions, checked: boolean) => {
    if (textOptions) {
      setTextOptions((prev) => prev ? { ...prev, [key]: checked } : prev);
    }
  };

  const handleCustomize = () => {
    setTextOptions(defaultTextOptions);
  };

  const handleOptOut = () => {
    setTextOptions(null);
  };

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
    const scheduledDate = DateTime.fromFormat(
      scheduledFor,
      "yyyy-MM-dd'T'HH:mm",
    );
    if (
      !scheduledDate.isValid ||
      scheduledDate < DateTime.now().plus({ minutes: 1 })
    ) {
      setError("Scheduled time must be at least 1 minute from now and valid.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await httpService.post<HttpResponse<CreatedTournament>>(
        "/tournaments",
        {
          title,
          description,
          scheduledFor: scheduledDate.toISO(),
          textOptions,
        },
      );
      if (response.data.success) {
        toast({
          title: "Tournament Created",
          description: "Your tournament has been created successfully.",
        });
        onOpenChange(false);
        onCreateSuccess(response.data.data.id);
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
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              placeholder="(Optional) Description"
            />
          </div>
          <div>
            <Label htmlFor="scheduledFor">Scheduled For</Label>
            <Input
              id="scheduledFor"
              type="datetime-local"
              value={scheduledFor}
              min={DateTime.now().plus({ minutes: 1 }).toFormat("yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => setScheduledFor(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <Label>Text Options</Label>
            {textOptions === null ? (
              <div className="mt-2">
                <Button type="button" variant="outline" onClick={handleCustomize} className="w-full">
                  Customize Text Options
                </Button>
                <div className="text-xs text-muted-foreground mt-1">
                  (Leave as is to let the system decide text options)
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="uppercase"
                    checked={textOptions.uppercase}
                    onCheckedChange={(checked) => handleTextOptionChange("uppercase", !!checked)}
                  />
                  <Label htmlFor="uppercase">Uppercase</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="lowercase"
                    checked={textOptions.lowercase}
                    onCheckedChange={(checked) => handleTextOptionChange("lowercase", !!checked)}
                  />
                  <Label htmlFor="lowercase">Lowercase</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="numbers"
                    checked={textOptions.numbers}
                    onCheckedChange={(checked) => handleTextOptionChange("numbers", !!checked)}
                  />
                  <Label htmlFor="numbers">Numbers</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="symbols"
                    checked={textOptions.symbols}
                    onCheckedChange={(checked) => handleTextOptionChange("symbols", !!checked)}
                  />
                  <Label htmlFor="symbols">Symbols</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="meaningful"
                    checked={textOptions.meaningful}
                    onCheckedChange={(checked) => handleTextOptionChange("meaningful", !!checked)}
                  />
                  <Label htmlFor="meaningful">Meaningful</Label>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={handleOptOut} className="ml-2 mt-2">
                  Use System Default
                </Button>
              </div>
            )}
          </div>
          {error && <div className="text-destructive text-sm">{error}</div>}
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader className="animate-spin" />
              ) : (
                "Create Tournament"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
