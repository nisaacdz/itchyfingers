import { useAuth } from "@/hooks/useAuth";
import { TournamentHeader } from "@/components/tournament/TournamentHeader";
import { MainContentLayout } from "@/components/tournament/MainContentLayout";
import { ParticipantsPanel } from "@/components/tournament/ParticipantsPanel";
import { TypingChallengeArea } from "@/components/tournament/TypingChallengeArea";
import { StatsPanel } from "@/components/tournament/StatsPanel";
import {
  ParticipantData,
  TournamentData,
} from "@/types/api";

type TournamentOrchestratorProps = {
  participants: Record<string, ParticipantData>;
  tournamentData: TournamentData;
};

export const TournamentRoomOrchestrator = ({
  participants,
  tournamentData,
}: TournamentOrchestratorProps) => {
  const { client } = useAuth();

  const toWatch = participants[client.id] || Object.values(participants).sort((a, b) => b.correctPosition - a.correctPosition)[0] || null;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-slate-100 font-sans overflow-hidden">
      <TournamentHeader
        tournamentData={tournamentData}
        toWatch={toWatch}
      />
      <MainContentLayout
        statsSlot={
          <StatsPanel toWatch={toWatch} textLength={tournamentData.text?.length ?? 0} upcoming={!tournamentData.startedAt} />
        }
        participantsSlot={
          <ParticipantsPanel
            participants={participants}
            textLength={tournamentData.text?.length ?? 0}
            started={!!tournamentData.startedAt}
            toWatch={toWatch}
          />
        }
        mainChallengeSlot={
          <TypingChallengeArea
            toWatch={toWatch}
            participants={participants}
            data={tournamentData}
          />
        }
      />
    </div>
  );
};