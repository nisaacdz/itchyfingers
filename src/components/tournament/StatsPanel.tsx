// @/components/tournament/sections/StatsPanel.tsx
import { ParticipantData } from "@/types/api";
import { GamePhase } from "@/hooks/useTournamentRealtime";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle, Percent, Zap, Clock } from "lucide-react"; // Example icons
import { ReactNode } from "react";
import { TimerDisplay } from "./TimerDisplay";

interface StatDisplayProps {
  icon: React.ElementType;
  label: string;
  value: ReactNode | number;
  unit?: string;
  iconColor?: string;
}

const StatDisplayItem: React.FC<StatDisplayProps> = ({
  icon: Icon,
  label,
  value,
  unit,
  iconColor = "text-cyan-400",
}) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2 text-slate-300">
      <Icon size={16} className={iconColor} />
      <span>{label}</span>
    </div>
    <span className="font-semibold text-slate-100">
      {value} <span className="text-xs text-slate-400">{unit}</span>
    </span>
  </div>
);

interface StatsPanelProps {
  userSession: ParticipantData | null;
  totalTextLength: number;
  gamePhase: GamePhase;
}

export const StatsPanel = ({
  userSession,
  totalTextLength,
  gamePhase,
}: StatsPanelProps) => {
  if (!userSession || gamePhase === "lobby" || gamePhase === "countdown") {
    return (
      <div className="text-center text-slate-400 py-4">
        <h3 className="text-lg font-semibold mb-2 text-slate-200">
          Your Stats
        </h3>
        <p className="text-sm">
          {gamePhase === "lobby" || gamePhase === "countdown"
            ? "Stats will appear once the race starts."
            : "No active session."}
        </p>
      </div>
    );
  }

  const progressPercentage =
    totalTextLength > 0
      ? (userSession.correct_position / totalTextLength) * 100
      : 0;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-slate-100 border-b border-slate-700 pb-2">
        Your Performance
      </h3>
      <div className="space-y-3">
        <StatDisplayItem
          icon={Zap}
          label="Speed"
          value={Math.round(userSession.current_speed)}
          unit="WPM"
          iconColor="text-yellow-400"
        />
        <StatDisplayItem
          icon={Target}
          label="Accuracy"
          value={userSession.current_accuracy.toFixed(1)}
          unit="%"
          iconColor="text-green-400"
        />
        <StatDisplayItem
          icon={CheckCircle}
          label="Correct"
          value={userSession.correct_position}
          unit="chars"
          iconColor="text-blue-400"
        />
        <StatDisplayItem
          icon={Percent}
          label="Progress"
          value={progressPercentage.toFixed(0)}
          unit="%"
        />
        <Progress
          value={progressPercentage}
          className="w-full h-2 bg-slate-700 [&>div]:bg-cyan-500"
        />
        {/* Optional: Add time elapsed */}
        {userSession.started_at && (
          <StatDisplayItem
            icon={Clock}
            label="Time"
            value={
              <TimerDisplay startTime={userSession.started_at} mode="elapsed" />
            }
          />
        )}
      </div>
    </div>
  );
};
