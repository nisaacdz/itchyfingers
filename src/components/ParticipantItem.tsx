import React from "react";
import { Progress } from "@/components/ui/progress";
import { TypingSessionSchema } from "@/types/api";

interface ParticipantItemProps {
  participant: TypingSessionSchema;
  isCurrentUser: boolean;
  textLength: number;
}

const ParticipantItem = React.memo(function ParticipantItem({
  participant,
  isCurrentUser,
  textLength,
}: ParticipantItemProps) {
  return (
    <div className="space-y-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
      <div className="flex justify-between items-center">
        <span className={`font-medium ${isCurrentUser ? "text-primary" : ""}`}>
          {participant.client.user
            ? participant.client.user.username
            : `Anonymous (${participant.client.id.substring(0, 6)})`}
          {isCurrentUser && " (You)"}
        </span>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>{participant.current_speed.toFixed(0)} WPM</span>
          <span>{participant.current_accuracy.toFixed(1)}%</span>
        </div>
      </div>
      <Progress
        value={(participant.correct_position / (textLength || 1)) * 100}
        className="h-2"
      />
      {participant.current_position !== participant.correct_position && (
        <Progress
          value={(participant.current_position / (textLength || 1)) * 100}
          className="h-1 mt-1 opacity-50"
        />
      )}
    </div>
  );
});

export default ParticipantItem;
