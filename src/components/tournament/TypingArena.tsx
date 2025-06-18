import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { ParticipantData, ClientSchema } from "@/types/api";
import { GamePhase } from "@/hooks/useTournamentRealtime";
import { TextRenderer } from "./TextRenderer";
import { Caret } from "./Caret";
import {
  computeAbsolutePosition,
  createWhiteSpaceErrorHighlightStyle,
} from "@/lib/typing";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface TypingArenaProps {
  text: string;
  allParticipants: Record<string, ParticipantData>;
  currentUserAuthId: string; // The authenticated user's client.id
  currentUserSession: ParticipantData;
  onCharTyped: (char: string) => void;
  gamePhase: GamePhase;
}

// Helper to get font size and line height
const getParagraphMetrics = (
  paragraphEl: HTMLParagraphElement | null,
): { fontSize: number; lineHeight: number; charWidth: number } => {
  if (!paragraphEl) return { fontSize: 24, lineHeight: 32, charWidth: 14 }; // Fallback values
  const style = window.getComputedStyle(paragraphEl);
  const fontSize = parseFloat(style.fontSize);
  const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.33; // Approx if 'normal'

  // Estimate char width for Courier Prime (monospace)
  // Create a temporary span, measure one character
  const tempSpan = document.createElement("span");
  tempSpan.style.font = style.font;
  tempSpan.style.visibility = "hidden";
  tempSpan.style.position = "absolute";
  tempSpan.textContent = "M"; // Any character for monospace
  document.body.appendChild(tempSpan);
  const charWidth = tempSpan.offsetWidth;
  document.body.removeChild(tempSpan);

  return { fontSize, lineHeight, charWidth: charWidth || fontSize * 0.6 }; // Fallback for charWidth
};

export const TypingArena = ({
  text,
  allParticipants,
  currentUserAuthId,
  currentUserSession,
  onCharTyped,
  gamePhase,
}: TypingArenaProps) => {
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const [metrics, setMetrics] = useState({
    fontSize: 24,
    lineHeight: 36,
    charWidth: 14.4,
  }); // Initial reasonable defaults

  // Update metrics when the paragraph ref is available or text changes (in case font loads late)
  useEffect(() => {
    if (paragraphRef.current) {
      setMetrics(getParagraphMetrics(paragraphRef.current));
      // Optional: Add a ResizeObserver to update metrics if window/container resizes
      const resizeObserver = new ResizeObserver(() => {
        if (paragraphRef.current) {
          setMetrics(getParagraphMetrics(paragraphRef.current));
        }
      });
      resizeObserver.observe(paragraphRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [text]); // Re-calculate if text changes, as it might affect layout before font fully applies

  // Global keydown listener for typing input
  useEffect(() => {
    if (gamePhase !== "active") return; // Only listen when actively typing

    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for keys we handle (Space, Backspace, printable chars)
      // to avoid page scroll, etc.
      if (
        event.key === " " ||
        event.key === "Backspace" ||
        (event.key.length === 1 &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey)
      ) {
        event.preventDefault();
      } else {
        return; // Ignore other keys like Tab, Shift, Ctrl, etc.
      }

      if (event.key === "Backspace") {
        onCharTyped("\b"); // Use '\b' or a specific agreed signal for backspace
      } else if (event.key.length === 1) {
        // Printable characters
        onCharTyped(event.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCharTyped, gamePhase]);

  // Memoize caret positions to avoid re-computation if participant data hasn't changed relevantly
  const caretPositions = useMemo(() => {
    const positions: Record<string, { top: number; left: number }> = {};
    if (paragraphRef.current) {
      Object.values(allParticipants).forEach((p) => {
        positions[p.client.id] = computeAbsolutePosition(
          paragraphRef,
          p.current_position,
        );
      });
    }
    return positions;
  }, [allParticipants, metrics]);

  // Calculate whitespace error highlights for the current user
  const whiteSpaceErrorHighlights = useMemo(() => {
    if (
      !paragraphRef.current ||
      !currentUserSession ||
      currentUserSession.correct_position ===
        currentUserSession.current_position
    ) {
      return [];
    }
    const highlights = [];
    for (
      let i = currentUserSession.correct_position;
      i < currentUserSession.current_position;
      i++
    ) {
      if (text[i] === " ") {
        const pos = computeAbsolutePosition(paragraphRef, i);
        highlights.push(
          <div
            key={`ws-error-${i}`}
            style={createWhiteSpaceErrorHighlightStyle(
              pos,
              metrics.charWidth,
              metrics.lineHeight,
            )}
            className="pointer-events-none" // So it doesn't interfere with text selection/carets
          />,
        );
      }
    }
    return highlights;
  }, [currentUserSession, text, metrics]);

  if (gamePhase === "user_completed") {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full p-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CheckCircle2 size={64} className="text-green-400 mb-4" />
          <h3 className="text-3xl font-bold text-slate-100 mb-2">
            You Finished!
          </h3>
          <p className="text-slate-300">
            Great job! Waiting for other racers to complete.
          </p>
          <p className="text-sm text-slate-400 mt-4">
            WPM: {Math.round(currentUserSession.current_speed)}, Accuracy:{" "}
            {currentUserSession.current_accuracy.toFixed(1)}%
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full flex items-center justify-center p-2 md:p-4 focus:outline-none"
      tabIndex={-1}
    >
      {/* Container for text and absolutely positioned elements to ensure correct offset calculations */}
      <div className="relative w-full max-w-3xl md:max-w-4xl">
        <TextRenderer
          text={text}
          correctPosition={currentUserSession.correct_position}
          currentPosition={currentUserSession.current_position}
          paragraphRef={paragraphRef}
          className="min-h-[100px] md:min-h-[150px] max-h-[60vh] overflow-y-auto custom-scrollbar p-3 bg-slate-900/50 rounded-md shadow-inner"
        />

        {/* Render whitespace error highlights */}
        <AnimatePresence>
          {whiteSpaceErrorHighlights.map((highlight) => (
            <motion.div
              key={(highlight.props as any).key} // Access key from the element
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
            >
              {highlight}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Render carets for all participants */}
        {Object.values(allParticipants).map((p) => {
          const pos = caretPositions[p.client.id];
          if (!pos) return null; // Position not yet calculated

          return (
            <Caret
              key={p.client.id}
              id={p.client.id}
              position={pos}
              height={metrics.lineHeight}
              isCurrentUser={p.client.id === currentUserAuthId}
              displayName={
                p.client.user?.username || `Anon-${p.client.id.substring(0, 4)}`
              }
            />
          );
        })}
      </div>
    </div>
  );
};
