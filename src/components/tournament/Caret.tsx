// @/components/tournament/elements/Caret.tsx
import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CaretProps {
  id: string; // Unique ID, e.g., client.id
  position: { top: number; left: number };
  height: number; // Should match the line height or font size of the text
  isCurrentUser: boolean;
  color?: string; // Allow custom color for different users if desired
  displayName?: string; // Optional: show name above caret
}

export const Caret = memo(
  ({ id, position, height, isCurrentUser, color, displayName }: CaretProps) => {
    // Blinking animation for the current user's caret
    const caretVariants = {
      blinking: {
        opacity: [0, 1, 0],
        transition: { duration: 1, repeat: Infinity, ease: "linear" },
      },
      still: {
        opacity: isCurrentUser ? 0.9 : 0.5, // Dimmer for other users
      },
    };

    const caretStyle: React.CSSProperties = {
      position: "absolute",
      top: `${position.top}px`,
      left: `${position.left}px`,
      height: `${height}px`,
      width: "2px", // Standard caret width
      backgroundColor:
        color ||
        (isCurrentUser ? "rgb(56 189 248)" : "rgba(100, 116, 139, 0.7)"), // Default: sky-500 for user, slate-500 for others
      zIndex: 10,
      borderRadius: "1px",
      // Using transform for smoother sub-pixel positioning if available via 'left'
      // transform: `translate3d(${position.left}px, ${position.top}px, 0)`,
    };

    // User label styling
    const labelStyle: React.CSSProperties = {
      position: "absolute",
      top: `${position.top - height * 0.8}px`, // Position above the caret
      left: `${position.left + 5}px`, // Slightly to the right
      fontSize: "10px",
      padding: "1px 3px",
      borderRadius: "3px",
      backgroundColor: isCurrentUser
        ? "rgba(56, 189, 248, 0.8)"
        : "rgba(100, 116, 139, 0.6)",
      color: "white",
      whiteSpace: "nowrap",
      zIndex: 11, // Above caret
      opacity: isCurrentUser ? 0.9 : 0.6,
      pointerEvents: "none",
      transform: "translateX(-50%)", // Center label if possible, might need adjustment
    };

    return (
      <>
        {displayName &&
          !isCurrentUser && ( // Only show names for other users, and if provided
            <motion.div
              key={`${id}-label`}
              style={labelStyle}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: isCurrentUser ? 0.9 : 0.6, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {displayName}
            </motion.div>
          )}
        <motion.div
          key={`${id}-caret`} // Important for framer-motion to track elements if list changes
          style={caretStyle}
          variants={caretVariants}
          animate={isCurrentUser ? "blinking" : "still"}
          initial={false} // Don't run initial animation unless 'animate' changes
          // layout // Experimental: for smoother transitions if carets reorder, might be costly
        />
      </>
    );
  },
);

Caret.displayName = "Caret";
