"use client";
import { useState } from "react";
import Modal from "react-modal";
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
import { CreateChallenge } from "@/types/forms";
import { createChallenge } from "@/api/requests";
import { Loader } from "lucide-react";

type CreateChallengeModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
};

Modal.setAppElement("#__next"); //

const CreateChallengeModal = ({
  isOpen,
  onRequestClose,
}: CreateChallengeModalProps) => {
  const [formData, setFormData] = useState<CreateChallenge>({
    challengeType: "Open",
    duration: 300,
    startTime: DateTime.now().plus({ minutes: 5 }).toISO(),
    includeSpecialChars: false,
    includeUppercase: false,
  });

  const [creatingChallenge, setCreatingChallenge] = useState(false);

  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTime = DateTime.fromISO(formData.startTime);
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

    createChallenge(formData)
      .finally(() => setCreatingChallenge(false))
      .finally(onRequestClose);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="inset-0 flex items-center justify-center p-4 z-20"
      overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
        <h2 className="mb-6 text-2xl font-bold">Create New Challenge</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Challenge Type */}
            <div className="space-y-2">
              <Label>Challenge Type</Label>
              <Select
                value={formData.challengeType}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    challengeType: value as "Open" | "Invitational",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open Challenge</SelectItem>
                  <SelectItem value="Invitational">Invitational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="datetime-local"
                min={DateTime.now()
                  .plus({ minutes: 1 })
                  .toFormat("yyyy-MM-dd'T'HH:mm")}
                value={DateTime.fromISO(formData.startTime).toFormat(
                  "yyyy-MM-dd'T'HH:mm",
                )}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startTime:
                      DateTime.fromISO(e.target.value).toISO() ||
                      prev.startTime,
                  }))
                }
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                min="1"
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
            <div className="space-y-2">
              <Label>Text Options</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.includeSpecialChars}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        includeSpecialChars: e.target.checked,
                      }))
                    }
                  />
                  Include Special Characters
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.includeUppercase}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        includeUppercase: e.target.checked,
                      }))
                    }
                  />
                  Include Uppercase
                </label>
              </div>
            </div>

            {validationError && (
              <p className="text-sm text-destructive">{validationError}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onRequestClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex items-center w-36"
              disabled={creatingChallenge}
            >
              {creatingChallenge ? (
                <Loader className="animate-spin" />
              ) : (
                <>Create Challenge</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateChallengeModal;
