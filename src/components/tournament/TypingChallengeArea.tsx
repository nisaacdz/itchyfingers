import { ParticipantData, TournamentData } from "@/types/api";
import { CountdownTimer } from "./CountdownTimer";
import { PostGameSummary } from "./PostGameSummary";
import { TypingArena } from "./TypingArena";
import { getStatus } from "@/lib/utils";
import { useRoomStore } from "@/stores/roomStore";

export const TypingChallengeArea = ({
  toWatch,
}: {
  toWatch: ParticipantData | null;
}) => {
  const { data } = useRoomStore();

  if (!data) return null;

  const status = getStatus(data);

  switch (status) {
    case "upcoming":
      return <CountdownTimer scheduledFor={data.scheduledFor} />;
    case "started":
      return <TypingArena toWatch={toWatch} />;
    case "ended":
      return <PostGameSummary />;
  }
};
