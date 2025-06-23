import { useAuth } from "@/hooks/useAuth";
import { TournamentHeader } from "@/components/tournament/TournamentHeader";
import { MainContentLayout } from "@/components/tournament/MainContentLayout";
import { ParticipantsPanel } from "@/components/tournament/ParticipantsPanel";
import { TypingChallengeArea } from "@/components/tournament/TypingChallengeArea";
import { StatsPanel } from "@/components/tournament/StatsPanel";
import { ParticipantData } from "@/types/api";
import { useRoom } from "@/hooks/useRoom";

export const TournamentRoomOrchestrator = () => {
  const { data, participants, member, participating } = useRoom();
  let toWatch: ParticipantData | null = null;
  toWatch =
    participants[member.id] ||
    Object.values(participants).sort(
      (a, b) => b.correctPosition - a.correctPosition,
    )[0] ||
    null;
  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden">
      <TournamentHeader toWatch={toWatch} />
      <MainContentLayout
        statsSlot={
          <StatsPanel
            toWatch={toWatch}
            textLength={data.text?.length ?? 0}
            upcoming={!data.startedAt}
            participating={participating}
          />
        }
        participantsSlot={<ParticipantsPanel toWatch={toWatch} />}
        mainChallengeSlot={<TypingChallengeArea toWatch={toWatch} />}
      />
    </div>
  );
};
