import { Participant } from "@/types/request";
import { SpeedVortexMeter, SpeedVortexWaiting } from "./SpeedVortexMeter";
import { AccuracyMeter, AccuracyMeterActive } from "./AccuracyMeter";
import { LogOut, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type StatsBoardProps = {
  currentParticipant: Participant;
  textLength: number;
  onLeave: () => void;
  onRestart: () => void;
};

export const StatsBoard = ({
  currentParticipant,
  textLength,
  onLeave,
  onRestart,
}: StatsBoardProps) => {
  const completionPercentage =
    textLength !== 0
      ? (currentParticipant.current_position / textLength) * 100
      : 0;

  const speedMeterInitializing =
    !currentParticipant ||
    !currentParticipant.started_at ||
    new Date().getTime() - new Date(currentParticipant.started_at).getTime() <
      3000;

  const accuracyMeterActive = !currentParticipant.ended_at;

  return (
    <div className="flex flex-col w-full h-full gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-muted-foreground">Your Stats</h1>
        {currentParticipant.ended_at ? (
          <button
            onClick={onRestart}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors duration-200"
            title="Restart"
          >
            <RotateCcw size={16} />
          </button>
        ) : (
          <button
            onClick={onLeave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors duration-200"
            title="Exit Zone"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="flex justify-center">
          {speedMeterInitializing ? (
            <SpeedVortexWaiting wpm={currentParticipant.current_speed} />
          ) : (
            <SpeedVortexMeter wpm={currentParticipant.current_speed} />
          )}
        </div>
        <div className="flex justify-center">
          {accuracyMeterActive ? (
            <AccuracyMeterActive
              accuracy={currentParticipant.current_accuracy}
            />
          ) : (
            <AccuracyMeter accuracy={currentParticipant.current_accuracy} />
          )}
        </div>
      </div>
    </div>
  );
};

export const StatsBoardLoading = () => {
  return (
    <div className="flex flex-col w-full h-full gap-4 p-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-7 w-32 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Progress Bar Skeleton */}
      <Skeleton className="w-full h-3 rounded-full" />

      <div className="grid grid-cols-1 gap-6">
        <div className="flex justify-center">
          <Skeleton className="w-24 h-24 rounded-full" />
        </div>
        <div className="flex justify-center">
          <Skeleton className="w-24 h-24 rounded-full" />
        </div>
      </div>
    </div>
  );
};
