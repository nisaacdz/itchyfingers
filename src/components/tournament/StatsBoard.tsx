import React from "react";
import { ParticipantData, TournamentData, TournamentStatus } from "../../types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StatsBoardProps {
  participant: ParticipantData | null;
  textLength: number;
  tournamentStatus: TournamentStatus;
  onLeaveTournament: () => void;
  // onRestart?: () => void; // If restart functionality is needed
}

const StatsDisplay: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-2xl font-bold text-foreground">{value}</span>
  </div>
);

const StatsBoard: React.FC<StatsBoardProps> = ({
  participant,
  textLength,
  tournamentStatus,
  onLeaveTournament,
}) => {
  const wpm = participant?.currentSpeed.toFixed(0) || "0";
  const accuracy = participant?.currentAccuracy.toFixed(0) || "0";
  const progress =
    textLength > 0 && participant
      ? ((participant.currentPosition / textLength) * 100).toFixed(0)
      : "0";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <StatsDisplay label="Speed (WPM)" value={wpm} />
          <StatsDisplay label="Accuracy (%)" value={accuracy} />
          <StatsDisplay label="Progress (%)" value={progress} />
        </div>

        {/* Placeholder for a more visual progress bar if desired */}
        {/* <Progress value={parseFloat(progress)} className="w-full h-2" /> */}

        <div className="mt-4 flex flex-col space-y-2">
          {tournamentStatus === "started" && (
            <Button variant="outline" onClick={onLeaveTournament}>
              Leave Tournament
            </Button>
          )}
          {tournamentStatus === "ended" && (
            <p className="text-center text-green-500 font-semibold">
              Tournament Completed!
            </p>
          )}
          {tournamentStatus === "upcoming" && (
            <p className="text-center text-blue-500 font-semibold">
              Waiting for tournament to start...
            </p>
          )}
          {/* Add other actions like restart if applicable */}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsBoard;
