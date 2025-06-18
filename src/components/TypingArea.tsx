import React, { useEffect, useRef, useState } from "react";
import { ParticipantData, TournamentData } from "../types/api"; // Assuming api.ts is in ../types

interface TypingAreaProps {
  text: string;
  participants: ParticipantData[];
  currentTournament: TournamentData | null;
  clientId: string | null; // Assuming you have a way to identify the current user's client ID
  onCharacterInput: (char: string) => void;
  disabled?: boolean;
}

const Caret: React.FC<{
  participant: ParticipantData;
  text: string;
  parentRef: React.RefObject<HTMLDivElement>;
  fontSize: number;
}> = ({ participant, text, parentRef, fontSize }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (parentRef.current && text) {
      const textNode = parentRef.current.firstChild;
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        const range = document.createRange();
        const charPosition = Math.min(
          participant.current_position,
          text.length - 1,
        );
        if (charPosition < 0) return;

        try {
          range.setStart(textNode, charPosition);
          range.setEnd(textNode, charPosition);
          const rect = range.getBoundingClientRect();
          const parentRect = parentRef.current.getBoundingClientRect();
          setPosition({
            top: rect.top - parentRect.top,
            left: rect.left - parentRect.left,
          });
        } catch (e) {
          console.error("Error calculating caret position:", e);
          // Fallback or default position if calculation fails
          setPosition({
            top: 0,
            left:
              Math.min(participant.current_position, text.length) *
              (fontSize * 0.6),
          });
        }
      } else {
        // Fallback for when textNode is not as expected (e.g. empty text)
        setPosition({
          top: 0,
          left:
            Math.min(participant.current_position, text.length) *
            (fontSize * 0.6),
        });
      }
    }
  }, [participant.current_position, text, parentRef, fontSize]);

  return (
    <div
      style={{
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: "2px",
        height: `${fontSize}px`,
        backgroundColor:
          participant.client.user?.username === "You" ? "blue" : "gray", // Distinguish user's caret
        transition: "left 0.1s linear, top 0.1s linear",
      }}
      title={participant.client.user?.username || "Anonymous"}
    />
  );
};

const TypingArea: React.FC<TypingAreaProps> = ({
  text,
  participants,
  currentTournament,
  clientId,
  onCharacterInput,
  disabled = false,
}) => {
  const typingAreaRef = useRef<HTMLDivElement>(null);
  const textDisplayRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(18); // Default Courier Prime font size

  useEffect(() => {
    // Adjust font size dynamically or set based on preference
    // For Courier Prime, character width is consistent (approx 0.6 * font-size)
    // This is a simplified approach; a more robust solution might measure character width
    if (textDisplayRef.current) {
      const computedStyle = window.getComputedStyle(textDisplayRef.current);
      const fs = parseFloat(computedStyle.fontSize);
      setFontSize(fs);
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        disabled ||
        !currentTournament ||
        currentTournament.status !== "active"
      )
        return;

      // Allow basic input like space, and all printable characters.
      // You might want to expand this or make it more robust.
      if (event.key.length === 1) {
        onCharacterInput(event.key);
        event.preventDefault(); // Prevent default action if you're handling input
      } else if (event.key === "Backspace") {
        // Handle backspace if your logic supports it
        // onCharacterInput('Backspace'); // Or a special marker
        // event.preventDefault();
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => {
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, [onCharacterInput, disabled, currentTournament]);

  if (!currentTournament) {
    return (
      <div className="p-4 text-muted-foreground">Loading typing area...</div>
    );
  }

  const typedText = clientId
    ? participants.find((p) => p.client.id === clientId)?.current_position || 0
    : 0;
  const correctTextEnd = clientId
    ? participants.find((p) => p.client.id === clientId)?.correct_position || 0
    : 0;

  return (
    <div
      ref={typingAreaRef}
      className="relative p-6 border-2 border-muted rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
      style={{
        fontFamily: '"Courier Prime", monospace',
        lineHeight: `${fontSize * 1.5}px`,
      }}
      tabIndex={0} // Make it focusable
    >
      <div
        ref={textDisplayRef}
        className="whitespace-pre-wrap break-all"
        style={{ fontSize: `${fontSize}px` }}
      >
        {text.split("").map((char, index) => {
          let charColor = "text-foreground"; // Default
          if (clientId && index < typedText) {
            charColor =
              index < correctTextEnd ? "text-green-500" : "text-red-500";
          }
          return (
            <span key={index} className={charColor}>
              {char === " " && index >= correctTextEnd && index < typedText ? (
                <span className="bg-red-200 dark:bg-red-800 rounded-sm"> </span>
              ) : (
                char
              )}
            </span>
          );
        })}
      </div>
      {text &&
        participants.map((p) => (
          <Caret
            key={p.client.id}
            participant={p}
            text={text}
            parentRef={textDisplayRef}
            fontSize={fontSize}
          />
        ))}
      {currentTournament.status === "waiting" && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <p className="text-xl text-muted-foreground">
            Waiting for tournament to start...
          </p>
        </div>
      )}
      {currentTournament.status === "completed" && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <p className="text-xl text-muted-foreground">Tournament has ended.</p>
        </div>
      )}
      {disabled && currentTournament.status === "active" && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <p className="text-xl text-muted-foreground">Joining tournament...</p>
        </div>
      )}
    </div>
  );
};

export default TypingArea;
