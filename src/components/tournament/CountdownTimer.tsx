import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CountdownTimerProps {
  scheduledFor: string;
}

const calculateTimeLeft = (scheduledFor: string) => {
  const difference = +new Date(scheduledFor) - +new Date();
  if (difference > 0) {
    return Math.floor(difference / 1000);
  }
  return 0;
};

export const CountdownTimer = ({ scheduledFor }: CountdownTimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState(
    calculateTimeLeft(scheduledFor),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(calculateTimeLeft(scheduledFor));
    }, 250);
    
    return () => clearInterval(timer);
  }, [scheduledFor]);

  if (secondsLeft <= 0) {
    return (
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="text-7xl md:text-9xl font-extrabold text-green-400"
      >
        GO!
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center text-slate-100">
      <p className="text-2xl md:text-3xl mb-4 text-slate-300">Starting in...</p>
      {/* We add a `key` here to force Framer Motion to re-animate when the number changes */}
      <motion.div
        key={secondsLeft}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ ease: "easeInOut", duration: 0.5 }}
        className="text-7xl md:text-9xl font-extrabold tabular-nums bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
      >
        {secondsLeft}
      </motion.div>
    </div>
  );
};