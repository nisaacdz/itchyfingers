import { User } from "../types/request";
import { SpeedVortexMeter, SpeedVortexWaiting } from "./SpeedVortexMeter";
import { AccuracyMeter, AccuracyMeterActive } from "./AccuracyMeter";
import { LogOut, RotateCcw } from "lucide-react";
import { handleExitZone, handleRestartZone } from "../dummy_api";

type StatsBoardProps = {
  user: User;
  text: string;
};

const StatsBoard = ({ user, text }: StatsBoardProps) => {
  const completionPercentage =
    text.length !== 0 ? (user.currentPos / text.length) * 100 : 0;

  const onRestart = () => {
    handleRestartZone();
  };

  const onExit = () => {
    if (confirm("Are you sure you want to exit the zone?")) {
      handleExitZone();
    }
  };

  const speedMeterInitializing =
    !user.startTime || new Date().getTime() - user.startTime.getTime() < 3000;

  const accuracyMeterActive = !user.endTime;

  return (
    <div className="flex flex-col w-full h-full gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-100">Your Stats</h1>
        {user.endTime ? (
          <button
            onClick={onRestart}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors duration-200"
            title="Restart"
          >
            <RotateCcw size={16} />
          </button>
        ) : (
          <button
            onClick={onExit}
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
            <SpeedVortexWaiting speed={user.speed} />
          ) : (
            <SpeedVortexMeter speed={user.speed} />
          )}
        </div>
        <div className="flex justify-center">
          {accuracyMeterActive ? (
            <AccuracyMeterActive accuracy={user.accuracy} />
          ) : (
            <AccuracyMeter accuracy={user.accuracy} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsBoard;
