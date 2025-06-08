// src/components/TypingChallengeArea.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Assuming path
import { TypingInterface } from "./TypingInterface"; // Assuming path
import { TournamentSession, TournamentSchema } from "@/types/api"; // Adjust path

interface TypingChallengeAreaProps {
  liveSession: TournamentSession | null;
  // currentTournament: TournamentSchema | null; // Potentially for fallback text if liveSession.text is not available
}

export default function TypingChallengeArea({
  liveSession,
}: TypingChallengeAreaProps) {
  const getDescription = () => {
    if (liveSession?.started_at && !liveSession?.ended_at)
      return "The race is on!";
    if (liveSession?.ended_at) return "Race has ended.";
    return "Waiting for the tournament to start...";
  };

  return (
    <Card className="lg:col-span-2">
      {" "}
      {/* This class depends on the parent grid */}
      <CardHeader>
        <CardTitle>Text to Type</CardTitle>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* TypingInterface is assumed to get its text from the Zustand store directly */}
        {/* or it could receive text as a prop if that's how it's designed */}
        <TypingInterface />
      </CardContent>
    </Card>
  );
}
