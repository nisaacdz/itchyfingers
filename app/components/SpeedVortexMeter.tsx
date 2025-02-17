import React from "react";

export const SpeedVortexMeter = ({ wpm }: { wpm: number }) => {
  const normalizedSpeed = Math.min(Math.max(wpm, 15), 90);
  const progress = ((normalizedSpeed - 15) / (90 - 15)) * 100;
  const hue = ((normalizedSpeed - 15) / (90 - 15)) * 120; // 0 (red) to 120 (green)

  return (
    <div className="relative size-36">
      {/* Main Circle */}
      <div
        className="relative w-full h-full rounded-full border-4 overflow-hidden bg-black bg-opacity-90 transition-colors ease-in-out duration-300"
        style={{
          borderColor: `hsl(${hue}, 80%, 45%)`,
          boxShadow: `0 0 25px hsla(${hue}, 80%, 45%, 0.3)`,
        }}
      >
        {/* Wave Container */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 transition-transform ease-in-out duration-500"
            style={{
              transform: `translateY(${100 - progress}%)`,
              backgroundColor: `hsl(${hue}, 80%, 45%)`,
            }}
          >
            {/* Wave */}
            <svg
              viewBox="0 0 100 56"
              className="absolute w-full h-full animate-wave opacity-40 text-current"
            >
              <path
                fill="currentColor"
                d="M0 15 C30 28 70 4 100 15 L100 0 L0 0 Z"
              />
              <path
                fill="currentColor"
                d="M0 30 C30 18 70 40 100 30 L100 0 L0 0 Z"
              />
            </svg>
          </div>
        </div>
        {/* Speed Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-white text-shadow">{wpm}</div>
          <span className="text-base tracking-widest text-white uppercase">
            wpm
          </span>
        </div>
      </div>
      {/* Outer Ring */}
      <div className="absolute inset-0 border-2 border-white border-opacity-10 rounded-full -m-1.5 pointer-events-none" />
    </div>
  );
};

export const SpeedVortexWaiting = ({ wpm }: { wpm: number }) => {
  const normalizedSpeed = Math.min(Math.max(wpm, 15), 90);
  const progress = ((normalizedSpeed - 15) / (90 - 15)) * 100;
  const hue = ((normalizedSpeed - 15) / (90 - 15)) * 120; // 0 (red) to 120 (green)

  return (
    <div className="relative size-36">
      {/* Main Circle */}
      <div
        className="relative w-full h-full rounded-full border-4 overflow-hidden bg-black bg-opacity-90 transition-colors ease-in-out duration-300"
        style={{
          borderColor: `hsl(${hue}, 80%, 45%)`,
          boxShadow: `0 0 25px hsla(${hue}, 80%, 45%, 0.3)`,
        }}
      >
        {/* Wave Container */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 transition-transform ease-in-out duration-500"
            style={{
              transform: `translateY(${100 - progress}%)`,
              backgroundColor: `hsl(${hue}, 80%, 45%)`,
            }}
          >
            {/* Wave */}
            <svg
              viewBox="0 0 100 56"
              className="absolute w-full h-full animate-wave opacity-40 text-current"
            >
              <path
                fill="currentColor"
                d="M0 15 C30 28 70 4 100 15 L100 0 L0 0 Z"
              />
              <path
                fill="currentColor"
                d="M0 30 C30 18 70 40 100 30 L100 0 L0 0 Z"
              />
            </svg>
          </div>
        </div>
        {/* Speed Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-white text-shadow">---</div>
          <span className="text-base tracking-widest text-white uppercase">
            wpm
          </span>
        </div>
      </div>
      {/* Outer Ring */}
      <div className="absolute inset-0 border-2 border-white border-opacity-10 rounded-full -m-1.5 pointer-events-none" />
    </div>
  );
};
