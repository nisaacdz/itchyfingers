import React, { memo } from "react";
import { motion, Variants } from "framer-motion";

interface CaretProps {
  id: string;
  position: { top: number; left: number };
  height: number;
  isWatched: boolean;
  color?: string;
  displayName?: string;
}

export const Caret = memo(
  ({ id, position, height, isWatched, color, displayName }: CaretProps) => {
    const caretVariants: Variants = {
      blinking: {
        opacity: [0, 1, 0],
        transition: { duration: 1, repeat: Infinity, ease: "linear" },
      },
      still: {
        opacity: isWatched ? 0.9 : 0.5,
      },
    };

    const caretStyle: React.CSSProperties = {
      position: "absolute",
      top: `${position.top}px`,
      left: `${position.left}px`,
      height: `${height}px`,
      width: "2px",
      backgroundColor:
        color ||
        (isWatched ? "rgb(56 189 248)" : "rgba(100, 116, 139, 0.7)"),
      zIndex: 10,
      borderRadius: "1px",
      transform: `translate3d(${position.left}px, ${position.top}px, 0)`,
    };

    const labelStyle: React.CSSProperties = {
      position: "absolute",
      top: `${position.top - height * 0.8}px`,
      left: `${position.left + 5}px`,
      fontSize: "10px",
      padding: "1px 3px",
      borderRadius: "3px",
      backgroundColor: isWatched
        ? "rgba(56, 189, 248, 0.8)"
        : "rgba(100, 116, 139, 0.6)",
      color: "white",
      whiteSpace: "nowrap",
      zIndex: 11,
      opacity: isWatched ? 0.9 : 0.6,
      pointerEvents: "none",
      transform: "translateX(-50%)",
    };

    return (
      <>
        <motion.div
          key={`${id}-caret`}
          style={caretStyle}
          variants={caretVariants}
          animate={isWatched ? "blinking" : "still"}
          initial={false}
        />
      </>
    );
  },
);

Caret.displayName = "Caret";
