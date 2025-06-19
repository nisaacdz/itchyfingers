import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { ParticipantData, ClientSchema } from "@/types/api";
import { TextRenderer } from "./TextRenderer";
import { Caret } from "./Caret";
import {
  computeAbsolutePosition,
  createWhiteSpaceErrorHighlightStyle,
} from "@/lib/typing";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { socketService } from "@/api/socketService";
import { useAuth } from "@/hooks/useAuth";

interface TypingArenaProps {
  text: string;
  participants: Record<string, ParticipantData>;
  toWatch: ParticipantData | null,
}

const getParagraphMetrics = (
  paragraphEl: HTMLParagraphElement | null,
): { fontSize: number; lineHeight: number; charWidth: number } => {
  if (!paragraphEl) return { fontSize: 24, lineHeight: 32, charWidth: 14 };
  const style = window.getComputedStyle(paragraphEl);
  const fontSize = parseFloat(style.fontSize);
  const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.33;

  // Estimate char width for Courier Prime (monospace)
  // Create a temporary span, measure one character
  const tempSpan = document.createElement("span");
  tempSpan.style.font = style.font;
  tempSpan.style.visibility = "hidden";
  tempSpan.style.position = "absolute";
  tempSpan.textContent = "M";
  document.body.appendChild(tempSpan);
  const charWidth = tempSpan.offsetWidth;
  document.body.removeChild(tempSpan);

  return { fontSize, lineHeight, charWidth: charWidth || fontSize * 0.6 }; // Fallback for charWidth
};

export const TypingArena = ({
  text,
  participants,
  toWatch,
}: TypingArenaProps) => {
  const { client } = useAuth();
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const [metrics, setMetrics] = useState({
    fontSize: 24,
    lineHeight: 36,
    charWidth: 14.4,
  });

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
  }, [text]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
        return;
      }

      if (event.key === "Backspace") {
        const v = socketService.emit("type", { character: "\b" })
      } else if (event.key.length === 1) {
        socketService.emit("type", { character: event.key });
      }
    };

    if (toWatch?.client.id == client.id) window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [client.id, toWatch?.client.id]);

  // Memoize caret positions to avoid re-computation if participant data hasn't changed relevantly
  const caretPositions = useMemo(() => {
    const positions: Record<string, { top: number; left: number }> = {};
    if (paragraphRef.current) {
      Object.values(participants).forEach((p) => {
        positions[p.client.id] = computeAbsolutePosition(
          paragraphRef,
          p.currentPosition,
        );
      });
    }
    return positions;
  }, [participants]);

  // Calculate whitespace error highlights for the current user
  const whiteSpaceErrorHighlights = useMemo(() => {
    if (
      !paragraphRef.current ||
      !toWatch ||
      toWatch.correctPosition ===
      toWatch.currentPosition
    ) {
      return [];
    }
    const highlights = [];
    for (
      let i = toWatch.correctPosition;
      i < toWatch.currentPosition;
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
  }, [toWatch, text, metrics]);

  return (
    <div
      className="relative w-full h-full flex items-center justify-center p-2 md:p-4 focus:outline-none"
      tabIndex={-1}
    >
      {/* Container for text and absolutely positioned elements to ensure correct offset calculations */}
      <div className="relative w-full max-w-3xl md:max-w-4xl">
        <TextRenderer
          text={text}
          correctPosition={toWatch?.correctPosition || 0}
          currentPosition={toWatch?.currentPosition || 0}
          paragraphRef={paragraphRef}
          className="min-h-[100px] md:min-h-[150px] max-h-[60vh] overflow-y-auto custom-scrollbar p-3 bg-slate-900/50 rounded-md shadow-inner"
        />

        {/* Render whitespace error highlights */}
        <AnimatePresence>
          {whiteSpaceErrorHighlights.map((highlight) => (
            <motion.div
              key={highlight.key}
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
        {Object.values(participants).map((p) => {
          const pos = caretPositions[p.client.id];
          if (!pos) return null;

          return (
            <Caret
              key={p.client.id}
              id={p.client.id}
              position={pos}
              height={metrics.lineHeight}
              isWatched={p.client.id === toWatch?.client.id}
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
