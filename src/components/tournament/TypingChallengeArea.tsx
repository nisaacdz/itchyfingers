import { ParticipantData, TournamentData } from "@/types/api";
import { CountdownTimer } from "./CountdownTimer";
import { PostGameSummary } from "./PostGameSummary";
import { TypingArena } from "./TypingArena";
import { getStatus } from "@/lib/utils";
import { useRoom } from "@/hooks/useRoom";

export const TypingChallengeArea = ({ toWatch }: { toWatch: ParticipantData | null }) => {
  const { data } = useRoom();

  const status = getStatus(data);

  switch (status) {
    case "upcoming":
      return <CountdownTimer scheduledFor={data.scheduledFor} />
    case "started":
      return (
        <TypingArena toWatch={toWatch} />
      );
    case "ended":
      return (
        <PostGameSummary />
      );
  }
};
