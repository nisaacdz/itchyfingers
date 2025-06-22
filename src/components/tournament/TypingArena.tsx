import React, { useRef, useEffect, useState } from "react";
import { ParticipantData } from "@/types/api";
import { computeAbsolutePosition } from "@/lib/typing";
import { socketService } from "@/api/socketService";
import { useParagraphStyles } from "@/hooks/useParagraphStyles";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRoom } from "@/hooks/useRoom";

interface TypingArenaProps {
  toWatch: ParticipantData | null;
}

export const TypingArena = ({
  toWatch,
}: TypingArenaProps) => {
  const { data, participants } = useRoom();
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  const { fontSize } = useParagraphStyles(paragraphRef);

  const whiteSpaceErrorHighlights = paragraphRef.current && toWatch
    ? Array.from(
      {
        length:
          toWatch.currentPosition - toWatch.correctPosition,
      },
      (_, i) => toWatch.correctPosition + i,
    )
      .filter((pos) => data.text?.charAt(pos) === " ")
      .map((pos) => (
        <WhiteSpaceErrorHighlight
          key={pos}
          position={computeAbsolutePosition(paragraphRef, pos)}
          height={fontSize}
          width={fontSize * 0.6}
        />
      ))
    : [];

  const caretElements = Object.values(participants).map((p) => {
    const absPos = computeAbsolutePosition(paragraphRef, p.correctPosition);
    return (
      <Caret
        key={p.member.id}
        styles={{
          ...absPos,
          position: "absolute",
          zIndex: 11,
          height: fontSize,
          opacity: p.member.id == toWatch?.member.id ? 1 : 0.25,
        }}
      />
    );
  });

  return (
    <div
      className="relative w-full h-full flex items-center justify-center p-2 md:p-4 focus:outline-none"
      tabIndex={-1}
    >
      <KeyPopper className="absolute top-[15%] left-1/2 -translate-x-1/2 pointer-events-none z-20" />
      {/* Container for text and absolutely positioned elements to ensure correct offset calculations */}
      <div className="relative w-full max-w-3xl md:max-w-4xl">
        <p
          className="text-3xl font-medium text-muted-foreground font-courier-prime w-full h-full select-none"
          ref={paragraphRef}
        >
          <span className="text-yellow-600">
            {data.text?.slice(0, toWatch?.correctPosition || 0)}
          </span>
          <span className="text-red-600">
            {data.text?.slice(
              toWatch?.correctPosition || 0,
              toWatch?.currentPosition || 0,
            )}
          </span>
          {data.text?.slice(toWatch?.currentPosition || 0)}
        </p>

        {caretElements}
        {whiteSpaceErrorHighlights}
      </div>
    </div>
  );
};

type CaretProps = {
  styles?: React.CSSProperties;
};

const Caret: React.FC<CaretProps> = ({ styles = {} }) => {
  return (
    <div
      className="w-1 h-6 bg-black animate-blink bg-current"
      style={styles}
    ></div>
  );
};

type WhiteSpaceErrorHighlightProps = {
  position: { top: number; left: number };
  width: number;
  height: number;
};

const WhiteSpaceErrorHighlight: React.FC<
  WhiteSpaceErrorHighlightProps
> = ({ position, width, height }) => {
  return (
    <div
      key={`space-${position.top}-${position.left}`}
      className="absolute bg-red-400/50"
      style={{
        top: position.top,
        left: position.left,
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
};

type KeyPopperProps = {
  className?: string;
};

const KeyPopper = ({ className }: KeyPopperProps) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const { participating } = useRoom();
  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      clearTimeout(timeout)
      setActiveKey(null);
      if (event.key === "Backspace") {
        socketService.emit("type", { character: "\b" });
        setActiveKey("⌫")
      } else if (event.key.length === 1) {
        socketService.emit("type", { character: event.key });
        setActiveKey(event.key)
      }
    };

    const handleKeyUp = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setActiveKey(null)
      }, 500)
    };

    if (participating) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [participating]);

  return (<div className={cn(className)}>
    <AnimatePresence>
      {activeKey && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.8 }}
          animate={{ opacity: 1, y: 8, scale: 1.2, transition: { type: "spring", stiffness: 500, damping: 30, duration: 0.15 } }}
          exit={{ opacity: 0, y: 0, scale: 0.5, transition: { ease: "easeOut", duration: 0.15 } }}
          className="text-white bg-muted-foreground backdrop-blur-sm px-4 py-2 rounded-lg text-2xl font-semibold"
        >
          {activeKey}
        </motion.div>
      )}
    </AnimatePresence>
  </div>)
}
