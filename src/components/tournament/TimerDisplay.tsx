import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TimerDisplayProps {
  targetTime?: string | null; // For countdown
  startTime?: string | null; // For elapsed
  mode: "countdown" | "elapsed";
  onTimerEnd?: () => void;
  className?: string;
}

const formatTime = (totalSeconds: number): string => {
  if (totalSeconds < 0) totalSeconds = 0;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const TimerDisplay = ({
  targetTime,
  startTime,
  mode,
  onTimerEnd,
  className,
}: TimerDisplayProps) => {
  const [displayTime, setDisplayTime] = useState("00:00");

  useEffect(() => {
    // eslint-disable-next-line prefer-const
    let intervalId: NodeJS.Timeout;

    const updateTimer = () => {
      let totalSecondsLeftOrElapsed: number;

      if (mode === "countdown" && targetTime) {
        const difference = +new Date(targetTime) - +new Date();
        totalSecondsLeftOrElapsed = Math.max(0, Math.floor(difference / 1000));
        setDisplayTime(formatTime(totalSecondsLeftOrElapsed));
        if (totalSecondsLeftOrElapsed <= 0 && onTimerEnd) {
          onTimerEnd();
          if (intervalId) clearInterval(intervalId);
        }
      } else if (mode === "elapsed" && startTime) {
        const difference = +new Date() - +new Date(startTime);
        totalSecondsLeftOrElapsed = Math.floor(difference / 1000);
        setDisplayTime(formatTime(totalSecondsLeftOrElapsed));
      }
    };

    updateTimer(); // Initial call
    intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [targetTime, startTime, mode, onTimerEnd]);

  return <span className={cn("tabular-nums", className)}>{displayTime}</span>;
};
