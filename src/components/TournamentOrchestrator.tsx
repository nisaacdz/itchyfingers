import { useAuth } from "@/hooks/useAuth";
import { TournamentHeader } from "./TournamentHeader";
import { MainContentLayout } from "./tournament/MainContentLayout";
import { ParticipantsPanel } from "./ParticipantsPanel";
import { TypingChallengeArea } from "./tournament/TypingChallengeArea";
import {
  ParticipantData,
  TournamentData,
} from "@/types/api";
import { StatsBoard } from "./StatsBoard";

type TournamentOrchestratorProps = {
  participants: Record<string, ParticipantData>;
  tournamentData: TournamentData;
};

export const TournamentRoomOrchestrator = ({
  participants,
  tournamentData,
}: TournamentOrchestratorProps) => {
  const { client } = useAuth();

  const me = participants[client.id];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-slate-100 font-sans overflow-hidden">
      <TournamentHeader
        tournamentData={tournamentData}
        participant={me}
      />
      <MainContentLayout
        statsSlot={
          <StatsBoard participant={me} tournamentData={tournamentData} />
        }
        participantsSlot={
          <ParticipantsPanel
            participants={participants}
            textLength={tournamentData.text?.length ?? 0}
          />
        }
        mainChallengeSlot={
          <TypingChallengeArea
            text={tournamentData.text}
            participant={me}
          />
        }
      />
    </div>
  );
};