import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CountdownTimerProps {
  scheduledFor: string;
}

const calculateTimeLeft = (scheduledFor: string) => {
  const difference = +new Date(scheduledFor) - +new Date();
  let timeLeft = { seconds: 0 };
  if (difference > 0) {
    timeLeft = {
      seconds: Math.floor(difference / 1000), // Total seconds
    };
  }
  return timeLeft.seconds;
};

export const CountdownTimer = ({ scheduledFor }: CountdownTimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState(calculateTimeLeft(scheduledFor));

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const calculateTimeLeft = () => {
      const difference = +new Date(scheduledFor) - +new Date();
      let timeLeft = { seconds: 0 };
      if (difference > 0) {
        timeLeft = {
          seconds: Math.floor(difference / 1000), // Total seconds
        };
      }
      return timeLeft.seconds;
    };
    const timer = setTimeout(() => {
      setSecondsLeft(calculateTimeLeft());
    }, 300);

    return () => clearTimeout(timer);
  }, [secondsLeft, scheduledFor]);

  if (secondsLeft <= 0) {
    return (
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-7xl md:text-9xl font-extrabold text-green-400"
      >
        GO!
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center text-slate-100">
      <p className="text-2xl md:text-3xl mb-4 text-slate-300">Starting in...</p>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="text-7xl md:text-9xl font-extrabold tabular-nums bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
      >
        {secondsLeft}
      </motion.div>
    </div>
  );
};
