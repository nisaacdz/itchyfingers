import { ParticipantData, TournamentStatus } from "@/types/api";
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
  toWatch: ParticipantData | null;
  textLength: number;
  upcoming: boolean;
}

export const StatsPanel = ({
  toWatch,
  textLength,
  upcoming,
}: StatsPanelProps) => {
  if (!toWatch || upcoming) {
    return (
      <div className="text-center text-slate-400 py-4">
        <h3 className="text-lg font-semibold mb-2 text-slate-200">
          Stats
        </h3>
        <p className="text-sm">
          {upcoming
            ? "Stats will appear once the race starts."
            : "No participant to watch."}
        </p>
      </div>
    );
  }

  const progressPercentage =
    textLength > 0
      ? (toWatch.correctPosition / textLength) * 100
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
          value={Math.round(toWatch.currentSpeed)}
          unit="WPM"
          iconColor="text-yellow-400"
        />
        <StatDisplayItem
          icon={Target}
          label="Accuracy"
          value={toWatch.currentAccuracy.toFixed(1)}
          unit="%"
          iconColor="text-green-400"
        />
        <StatDisplayItem
          icon={CheckCircle}
          label="Correct"
          value={toWatch.correctPosition}
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
        {toWatch.startedAt && (
          <StatDisplayItem
            icon={Clock}
            label="Time"
            value={
              <TimerDisplay startTime={toWatch.startedAt} mode="elapsed" />
            }
          />
        )}
      </div>
    </div>
  );
};
