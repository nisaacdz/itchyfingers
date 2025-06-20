import React, { useRef, useEffect } from "react";
import { ParticipantData } from "@/types/api";
import { computeAbsolutePosition } from "@/lib/typing";
import { socketService } from "@/api/socketService";
import { useAuth } from "@/hooks/useAuth";
import { useParagraphStyles } from "@/hooks/useParagraphStyles";

interface TypingArenaProps {
  text: string;
  participants: Record<string, ParticipantData>;
  toWatch: ParticipantData | null;
}

export const TypingArena = ({
  text,
  participants,
  toWatch,
}: TypingArenaProps) => {
  const { client } = useAuth();
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  const { fontSize, lineHeight, lineSpacing } = useParagraphStyles(paragraphRef);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.key === "Backspace") {
        socketService.emit("type", { character: "\b" });
      } else if (event.key.length === 1) {
        socketService.emit("type", { character: event.key });
      }
    };

    if (toWatch?.client.id == client.id)
      window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [client.id, toWatch?.client.id]);

  const whiteSpaceErrorHighlights = paragraphRef.current && toWatch
    ? Array.from(
      {
        length:
          toWatch.currentPosition - toWatch.correctPosition,
      },
      (_, i) => toWatch.correctPosition + i,
    )
      .filter((pos) => text[pos] === " ")
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
        key={p.client.id}
        styles={{
          ...absPos,
          position: "absolute",
          zIndex: 11,
          height: fontSize,
          opacity: p.client.id == toWatch?.client.id ? 1 : 0.25,
        }}
      />
    );
  });

  return (
    <div
      className="relative w-full h-full flex items-center justify-center p-2 md:p-4 focus:outline-none"
      tabIndex={-1}
    >
      {/* Container for text and absolutely positioned elements to ensure correct offset calculations */}
      <div className="relative w-full max-w-3xl md:max-w-4xl">
        <p
          className="text-2xl font-medium text-muted-foreground font-courier-prime w-full h-full select-none"
          ref={paragraphRef}
        >
          <span className="text-yellow-600">
            {text.slice(0, toWatch?.correctPosition || 0)}
          </span>
          <span className="text-red-600">
            {text.slice(
              toWatch?.correctPosition || 0,
              toWatch?.currentPosition || 0,
            )}
          </span>
          {text.slice(toWatch?.currentPosition || 0)}
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
