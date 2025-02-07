import React from "react";

type AccuracyMeterProps = {
  accuracy: number;
};

export const AccuracyMeter = ({ accuracy }: AccuracyMeterProps) => {
  return (
    <div className="relative w-full h-auto max-h-48 bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-800">
      <div className="flex flex-col justify-between h-full">
        <div className="text-xl font-bold text-gray-300 mb-4">Accuracy</div>
        <div className="flex justify-evenly items-end">
          <div className="text-3xl xl:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {accuracy}%
          </div>
          <div className="relative w-1/2 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500"
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>
        <div className="text-sm text-gray-400 mt-2">
          {accuracy >= 90
            ? "Fantastic precision! 🎯"
            : accuracy >= 75
              ? "Good job! Keep going! 💪"
              : "Focus on accuracy! 👁️"}
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl pointer-events-none border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" />
    </div>
  );
};

export const AccuracyMeterActive = ({ accuracy }: AccuracyMeterProps) => {
  return (
    <div className="relative w-full h-auto max-h-48 bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-800">
      <div className="flex flex-col justify-between h-full">
        <div className="text-xl font-bold text-gray-300 mb-4">Accuracy</div>
        <div className="flex flex-col justify-between">
          <div className="text-3xl xl:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {accuracy}%
          </div>
          <div className="relative w-1/2 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500"
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl pointer-events-none border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" />
    </div>
  );
};
