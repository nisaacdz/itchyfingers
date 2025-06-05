"use client";
import { useState } from "react";
import { DateTime } from "luxon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateTournament } from "@/types/forms";
import { createTournament } from "@/api/requests";
import { Loader } from "lucide-react";

type CreateTournamentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const CreateTournamentModal = ({
  open,
  onOpenChange,
}: CreateTournamentModalProps) => {
  const [formData, setFormData] = useState<CreateTournament>({
    kind: "Open",
    duration: 300,
    scheduled_for: DateTime.now().plus({ minutes: 3 }).toISO(),
    includeSpecialChars: false,
    includeUppercase: false,
  });

  const [creatingChallenge, setCreatingChallenge] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTime = DateTime.fromISO(formData.scheduled_for);
    const minStartTime = DateTime.now().plus({ minutes: 1 });

    if (selectedTime < minStartTime) {
      setValidationError("Start time must be at least 1 minute from now");
      return;
    }

    if (formData.duration < 60) {
      setValidationError("Minimum duration is 1 minute");
      return;
    }

    setValidationError("");
    setCreatingChallenge(true);

    try {
      await createTournament(formData);
      onOpenChange(false);
    } finally {
      setCreatingChallenge(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">New Challenge</DialogTitle>
          <DialogDescription>
            Configure settings for your typing challenge
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Challenge Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="kind" className="text-right">
                Type
              </Label>
              <Select
                value={formData.kind}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    kind: value as "Open" | "Invitational",
                  }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select challenge type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open Challenge</SelectItem>
                  <SelectItem value="Invitational">Invitational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Time */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Start Time
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                className="col-span-3"
                min={DateTime.now()
                  .plus({ minutes: 1 })
                  .toFormat("yyyy-MM-dd'T'HH:mm")}
                value={DateTime.fromISO(formData.scheduled_for).toFormat(
                  "yyyy-MM-dd'T'HH:mm",
                )}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    scheduled_for:
                      DateTime.fromISO(e.target.value).toISO() ||
                      prev.scheduled_for,
                  }))
                }
              />
            </div>

            {/* Duration */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration (mins)
              </Label>
              <Input
                id="duration"
                type="number"
                min="1"
                className="col-span-3"
                value={Math.floor(formData.duration / 60)}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value) * 60,
                  }))
                }
              />
            </div>

            {/* Text Options */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Text Options</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="specialChars"
                    checked={formData.includeSpecialChars}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        includeSpecialChars: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="specialChars">Special Characters</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uppercase"
                    checked={formData.includeUppercase}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        includeUppercase: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="uppercase">Uppercase Letters</Label>
                </div>
              </div>
            </div>

            {validationError && (
              <p className="col-span-4 text-sm text-destructive text-center">
                {validationError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creatingChallenge}>
              {creatingChallenge && (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Challenge
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTournamentModal;
