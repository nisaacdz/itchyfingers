// src/components/tournament/TournamentCard.tsx

import { EvervaultCardContainer } from "../ui/evervault-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tournament, TournamentStatus } from "../../types/api";
import { Clock, Globe, Lock, Users } from "lucide-react";

function getTimeLeft(scheduledFor: string, status: TournamentStatus) {
  if (status === "started") return "Started";
  if (status === "ended") return "Ended";
  const now = new Date();
  const scheduledDate = new Date(scheduledFor);
  const diff = scheduledDate.getTime() - now.getTime();
  if (diff <= 0) return "Starting...";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

interface TournamentCardProps {
  tournament: Tournament;
  onJoinTournament: (tournamentId: string) => void;
  onSpectateTournament: (tournamentId: string) => void;
}

export function TournamentCard({
  tournament,
  onJoinTournament,
  onSpectateTournament,
}: TournamentCardProps) {
  const tournamentStatus = tournament.endedAt
    ? "ended"
    : tournament.startedAt
      ? "started"
      : "upcoming";
  const timeLeftOrStatus = getTimeLeft(
    tournament.scheduledFor,
    tournamentStatus,
  );

  return (
    <EvervaultCardContainer>
      <div className="relative z-10 p-6 flex flex-col h-full bg-slate-900/[0.8] rounded-3xl">
        {/* Top Section */}
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold tracking-tight text-white line-clamp-2">
              {tournament.title}
            </h2>
            <Badge
              variant={
                tournamentStatus === "upcoming"
                  ? "secondary"
                  : tournamentStatus === "started"
                    ? "default"
                    : "outline"
              }
              className="capitalize flex-shrink-0"
            >
              {tournamentStatus}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Created by {tournament.creator}
          </p>
        </div>

        {/* Middle Section */}
        <div className="flex-grow space-y-3 text-sm text-slate-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Participants</span>
            </div>
            <span className="font-medium text-white">
              {tournament.participantCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {tournament.privacy === "open" ? (
                <Globe className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              <span>Privacy</span>
            </div>
            <span className="capitalize font-medium text-white">
              {tournament.privacy}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {tournamentStatus === "upcoming" ? "Starts in" : "Status"}
              </span>
            </div>
            <span className="font-medium text-white">{timeLeftOrStatus}</span>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 mt-auto space-y-2">
          <Button
            className="w-full"
            onClick={() => onJoinTournament(tournament.id)}
            disabled={tournamentStatus === "ended"}
          >
            {tournament.participating ? "Enter" : "Join"} Tournament
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => onSpectateTournament(tournament.id)}
          >
            Spectate
          </Button>
        </div>
      </div>
    </EvervaultCardContainer>
  );
}
