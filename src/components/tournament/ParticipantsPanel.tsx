import { ParticipantData } from "@/types/api";
import { ParticipantItem } from "@/components/tournament/ParticipantItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";
import { useRoomStore } from "@/stores/roomStore";

interface ParticipantsPanelProps {
  toWatch?: ParticipantData | null;
}

export const ParticipantsPanel = ({ toWatch }: ParticipantsPanelProps) => {
  const { participants, data } = useRoomStore();
  const started = !!data?.startedAt;
  const textLength = data?.text?.length || 0;
  const participantArray = Object.values(participants);

  // Sort participants: current user first, then by progress (desc), then by WPM (desc)
  participantArray.sort((a, b) => {
    if (a.member.id === toWatch?.member.id) return -1;
    if (b.member.id === toWatch?.member.id) return 1;
    if (b.correctPosition !== a.correctPosition) {
      return b.correctPosition - a.correctPosition;
    }
    return b.currentSpeed - a.currentSpeed;
  });

  const title = started ? "Leaderboard" : "Participants";

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-3 text-muted-foreground border-b border-slate-700 pb-2 flex items-center gap-2">
        <Users size={20} className="text-foreground" />
        {title} ({participantArray.length})
      </h3>
      {participantArray.length === 0 ? (
        <p className="text-sm text-foreground text-center flex-grow flex items-center justify-center">
          {started
            ? "No participants found."
            : "Waiting for players to join..."}
        </p>
      ) : (
        <ScrollArea className="flex-grow pr-2 -mr-2 custom-scrollbar">
          {" "}
          {/* Negative margin to hide default scrollbar if custom is wider */}
          <div className="space-y-2">
            {participantArray.map((p) => (
              <ParticipantItem
                key={p.member.id}
                data={p}
                textLength={textLength}
                watched={toWatch?.member.id === p.member.id}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
