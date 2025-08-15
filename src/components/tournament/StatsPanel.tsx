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
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon size={16} className={iconColor} />
      <span>{label}</span>
    </div>
    <span className="font-semibold text-accent-foreground">
      {value} <span className="text-xs text-muted-foreground">{unit}</span>
    </span>
  </div>
);

interface StatsPanelProps {
  toWatch: ParticipantData | null;
  textLength: number;
  upcoming: boolean;
  participating: boolean;
}

export const StatsPanel = ({
  toWatch,
  textLength,
  upcoming,
  participating,
}: StatsPanelProps) => {
  if (!toWatch || upcoming) {
    return (
      <div className="text-center text-foreground py-4">
        <h3 className="text-lg font-semibold mb-2 text-foreground">Stats</h3>
        <p className="text-sm text-muted-foreground">
          {upcoming
            ? "Stats will appear once the race starts."
            : "No participant to watch."}
        </p>
      </div>
    );
  }

  const progressPercentage =
    textLength > 0 ? (toWatch.correctPosition / textLength) * 100 : 0;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-accent-foreground border-b border-slate-700 pb-2">
        {participating ? "Your Performance" : "Top Performance"}
      </h3>
      <div className="space-y-3">
        <StatDisplayItem
          icon={Zap}
          label="Speed"
          value={Math.round(toWatch.currentSpeed)}
          unit="WPM"
          iconColor="text-yellow-700"
        />
        <StatDisplayItem
          icon={Target}
          label="Accuracy"
          value={toWatch.currentAccuracy.toFixed(1)}
          unit="%"
          iconColor="text-green-700"
        />
        <StatDisplayItem
          icon={CheckCircle}
          label="Correct"
          value={toWatch.correctPosition}
          unit="chars"
          iconColor="text-blue-700"
        />
        <StatDisplayItem
          icon={Percent}
          label="Progress"
          value={progressPercentage.toFixed(0)}
          unit="%"
          iconColor="text-cyan-700"
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
