// src/pages/CreateTournament.tsx

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import httpService from "@/api/httpService";
import { toast } from "@/hooks/use-toast";
import { CreatedTournament, TextOptions } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import { Loader } from "lucide-react";

// --- Correct Aceternity UI Imports ---
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { SparklesCore } from "@/components/ui/sparkles"; // Your actual sparkles component

type CreateTournamentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSuccess: (tournamentId: string) => void;
};

const timePresets = {
  "1m": { minutes: 1 },
  "5m": { minutes: 5 },
  "15m": { minutes: 15 },
};

export function CreateTournamentDialog({
  open,
  onOpenChange,
  onCreateSuccess,
}: CreateTournamentDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeSelection, setTimeSelection] = useState<
    "1m" | "5m" | "15m" | "custom"
  >("5m");
  const [scheduledFor, setScheduledFor] = useState("");
  const [textOptions, setTextOptions] = useState<TextOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (timeSelection !== "custom") {
      const preset = timePresets[timeSelection];
      const newScheduledFor = DateTime.now()
        .plus(preset)
        .toFormat("yyyy-MM-dd'T'HH:mm");
      setScheduledFor(newScheduledFor);
    } else {
      const defaultCustom = DateTime.now()
        .plus({ minutes: 30 })
        .toFormat("yyyy-MM-dd'T'HH:mm");
      setScheduledFor(defaultCustom);
    }
  }, [timeSelection]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setTimeSelection("5m");
      setTextOptions(null);
      setError("");
      setIsLoading(false);
    }
  }, [open]);

  const defaultTextOptions: TextOptions = {
    uppercase: false,
    lowercase: true,
    numbers: false,
    symbols: false,
    meaningful: true,
  };

  const handleTextOptionChange = (key: keyof TextOptions, checked: boolean) => {
    setTextOptions((prev) => (prev ? { ...prev, [key]: checked } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      setIsLoading(false);
      return;
    }

    const scheduledDate = DateTime.fromISO(scheduledFor);
    if (!scheduledDate.isValid || scheduledDate <= DateTime.now()) {
      setError("Scheduled time must be in the future.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await httpService.post<CreatedTournament>(
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
          title: "Tournament Created!",
          description: "Your tournament is ready to go.",
        });
        onOpenChange(false);
        onCreateSuccess(response.data.data?.id || "");
      } else {
        setError(response.data.message || "Failed to create tournament.");
      }
    } catch (err) {
      setError((err instanceof Error && err.message) || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[576px] p-0 border-0">
        <BackgroundGradient className="rounded-[22px] p-6 bg-slate-900">
          <DialogHeader>
            {/* --- THIS IS THE CORRECTED IMPLEMENTATION --- */}
            <div className="relative w-full h-24 flex items-center justify-center mb-4">
              <div className="absolute inset-0 w-full h-full">
                <SparklesCore
                  id="creation-sparkles"
                  background="transparent"
                  minSize={0.4}
                  maxSize={1}
                  particleDensity={1200}
                  className="w-full h-full"
                  particleColor="#FFFFFF"
                />
              </div>
              <DialogTitle className="relative z-20 text-2xl font-bold text-white">
                Create New Tournament
              </DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isLoading}
                placeholder="e.g., Weekend Speed Run"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                placeholder="e.g., A quick tournament for fun"
              />
            </div>
            <div className="space-y-3">
              <Label>Start Time</Label>
              <div className="flex gap-2">
                {(
                  Object.keys(timePresets) as Array<keyof typeof timePresets>
                ).map((key) => (
                  <Button
                    type="button"
                    variant={timeSelection === key ? "default" : "outline"}
                    onClick={() => setTimeSelection(key)}
                    key={key}
                  >
                    In {key.replace("m", " min")}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant={timeSelection === "custom" ? "default" : "outline"}
                  onClick={() => setTimeSelection("custom")}
                >
                  Custom...
                </Button>
              </div>
              {timeSelection === "custom" && (
                <Input
                  id="scheduledFor"
                  type="datetime-local"
                  value={scheduledFor}
                  min={DateTime.now()
                    .plus({ minutes: 1 })
                    .toFormat("yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  required
                  disabled={isLoading}
                  className="mt-2"
                />
              )}
            </div>
            <div>
              <Label>Text Customization</Label>
              {textOptions === null ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTextOptions(defaultTextOptions)}
                  className="w-full mt-2"
                >
                  Customize Text
                </Button>
              ) : (
                <div className="p-4 border rounded-md mt-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {(
                      Object.keys(defaultTextOptions) as Array<
                        keyof TextOptions
                      >
                    ).map((key) => (
                      <div className="flex items-center gap-2" key={key}>
                        <Checkbox
                          id={key}
                          checked={textOptions[key]}
                          onCheckedChange={(checked) =>
                            handleTextOptionChange(key, !!checked)
                          }
                        />
                        <Label htmlFor={key} className="capitalize">
                          {key}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setTextOptions(null)}
                    className="w-full text-muted-foreground"
                  >
                    Use System Default Text
                  </Button>
                </div>
              )}
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
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
        </BackgroundGradient>
      </DialogContent>
    </Dialog>
  );
}
