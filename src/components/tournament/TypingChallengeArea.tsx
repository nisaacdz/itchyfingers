import { ParticipantData, TournamentData } from "@/types/api";
import { CountdownTimer } from "./CountdownTimer";
import { PostGameSummary } from "./PostGameSummary";
import { TypingArena } from "./TypingArena";
import { getStatus } from "@/lib/utils";

interface TypingChallengeAreaProps {
  toWatch: ParticipantData | null;
  participants: Record<string, ParticipantData>;
  data: TournamentData;
}

export const TypingChallengeArea = ({
  toWatch,
  participants,
  data
}: TypingChallengeAreaProps) => {

  const status = getStatus(data);

  switch (status) {
    case "upcoming":
      return <CountdownTimer scheduledFor={data.scheduledFor} />
    case "started":
      return (
        <TypingArena
          text={data.text || ""}
          participants={participants}
          toWatch={toWatch}
        />
      );
    case "ended":
      return (
        <PostGameSummary
          participants={participants}
        />
      );
  }
};
