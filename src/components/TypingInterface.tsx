import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTournamentStore } from "../store/tournamentStore";
import { useAuthStore } from "../store/authStore";
import socketService from "../api/socketService";
import { TypeArgs } from "../types/api";

// Helper component for rendering individual characters with appropriate styling
const CharacterSpan = React.memo(
  ({
    char,
    state,
  }: {
    char: string;
    state: "correct" | "incorrect" | "pending";
  }) => {
    let className = "font-courier-prime"; // Ensure monospace font
    if (state === "correct") {
      className += " text-green-500";
    } else if (state === "incorrect") {
      className += " text-red-500 bg-red-200 dark:bg-red-800";
    } else {
      className += " text-muted-foreground";
    }
    // Special handling for spaces to make them visible if incorrect or just to ensure they take up space
    if (char === " ") {
      if (state === "incorrect") {
        return <span className={className}>&nbsp;</span>; // Show incorrect space with background
      }
      return <span className={className}>&nbsp;</span>; // Regular space
    }
    return <span className={className}>{char}</span>;
  },
);

// Caret component
const Caret = ({
  top,
  left,
  height,
  color = "blue-500",
}: {
  top: number;
  left: number;
  height: number;
  color?: string;
}) => {
  return (
    <div
      className={`absolute w-0.5 bg-${color}`}
      style={{
        top: `${top}px`,
        left: `${left}px`,
        height: `${height}px`,
        transition: "left 0.1s linear, top 0.1s linear",
      }}
    />
  );
};

export const TypingInterface: React.FC = () => {
  const { currentTournament, liveTournamentSession, participants } =
    useTournamentStore();
  const { client: authClient } = useAuthStore();
  const textToType =
    liveTournamentSession?.text || currentTournament?.text || "";
  const myParticipantData = participants[authClient?.id];

  const [userInput, setUserInput] = useState<string>("");
  const [caretPosition, setCaretPosition] = useState({
    top: 0,
    left: 0,
    height: 0,
  });
  const textDisplayRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const currentPosition = myParticipantData?.current_position || 0;
  const correctPosition = myParticipantData?.correct_position || 0;

  // Initialize charRefs
  useEffect(() => {
    if (textToType) {
      charRefs.current = Array(textToType.length).fill(null);
    }
  }, [textToType]);

  // Update caret position
  useEffect(() => {
    if (textDisplayRef.current && charRefs.current.length > 0) {
      const currentCharlRef = charRefs.current[currentPosition];
      const defaultHeight = 24; // Default line height if not measurable

      if (currentCharlRef) {
        const rect = currentCharlRef.getBoundingClientRect();
        const containerRect = textDisplayRef.current.getBoundingClientRect();
        setCaretPosition({
          top: rect.top - containerRect.top,
          left: rect.left - containerRect.left,
          height: rect.height || defaultHeight,
        });
      } else if (currentPosition === 0 && charRefs.current[0]) {
        // Caret at the beginning
        const firstCharRef = charRefs.current[0];
        if (firstCharRef) {
          const rect = firstCharRef.getBoundingClientRect();
          const containerRect = textDisplayRef.current.getBoundingClientRect();
          setCaretPosition({
            top: rect.top - containerRect.top,
            left: rect.left - containerRect.top,
            height: rect.height || defaultHeight,
          });
        }
      } else if (currentPosition > 0 && charRefs.current[currentPosition - 1]) {
        // Caret at the end of text or on a new line
        const prevCharRef = charRefs.current[currentPosition - 1];
        if (prevCharRef) {
          const rect = prevCharRef.getBoundingClientRect();
          const containerRect = textDisplayRef.current.getBoundingClientRect();
          setCaretPosition({
            top: rect.top - containerRect.top,
            left: rect.right - containerRect.left, // Position after the last character
            height: rect.height || defaultHeight,
          });
        }
      } else if (textDisplayRef.current) {
        // Fallback for empty text or beginning
        const containerRect = textDisplayRef.current.getBoundingClientRect();
        setCaretPosition({
          top: 0,
          left: 0,
          height: defaultHeight, // Default height
        });
      }
    }
  }, [currentPosition, textToType, participants]); // Re-calculate when currentPosition or text changes

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      if (
        !liveTournamentSession ||
        liveTournamentSession.ended_at ||
        !liveTournamentSession.started_at
      ) {
        // Tournament not started or already ended
        return;
      }

      let char = "";
      if (event.key === "Backspace") {
        char = "\b"; // Represent backspace
        // setUserInput((prev) => prev.slice(0, -1)); // Basic local update, server is source of truth
      } else if (event.key.length === 1) {
        // Regular character
        char = event.key;
        // setUserInput((prev) => prev + event.key); // Basic local update
      }

      if (char) {
        const typeArgs: TypeArgs = { character: char };
        socketService.emitTypeCharacter(typeArgs);
      }
    },
    [liveTournamentSession],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  const getCharState = (index: number): "correct" | "incorrect" | "pending" => {
    if (index < correctPosition) {
      return "correct";
    }
    if (index < currentPosition) {
      return "incorrect";
    }
    return "pending";
  };

  if (!textToType) {
    return (
      <div className="p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
        <p className="text-muted-foreground">Waiting for tournament text...</p>
      </div>
    );
  }

  const isTournamentActive =
    liveTournamentSession?.started_at && !liveTournamentSession?.ended_at;

  return (
    <div
      className="relative p-4 bg-muted rounded-lg leading-relaxed text-lg"
      ref={textDisplayRef}
      style={{ fontFamily: '"Courier Prime", monospace' }}
    >
      {!isTournamentActive && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
          <p className="text-white text-2xl font-semibold">
            {liveTournamentSession?.started_at
              ? "Tournament Ended"
              : "Waiting for tournament to start..."}
          </p>
        </div>
      )}
      {textToType.split("").map((char, index) => (
        <span key={index} ref={(el) => (charRefs.current[index] = el)}>
          <CharacterSpan char={char} state={getCharState(index)} />
        </span>
      ))}
      {isTournamentActive && myParticipantData && (
        <Caret
          top={caretPosition.top}
          left={caretPosition.left}
          height={caretPosition.height}
        />
      )}
      {/* Display other participants' carets */}
      {isTournamentActive &&
        Object.values(participants)
          .filter(
            (p) =>
              p.client.id !== authClient?.id &&
              p.client.id !== myParticipantData?.client.id,
          ) // Exclude self and ensure no duplication if myParticipantData is also in participants
          .map((p) => {
            const charRef = charRefs.current[p.current_position];
            if (charRef && textDisplayRef.current) {
              const rect = charRef.getBoundingClientRect();
              const containerRect =
                textDisplayRef.current.getBoundingClientRect();
              return (
                <Caret
                  key={p.client.id}
                  top={rect.top - containerRect.top}
                  left={rect.left - containerRect.left}
                  height={rect.height}
                  color="gray-400" // Different color for other participants
                />
              );
            } else if (
              p.current_position === 0 &&
              charRefs.current[0] &&
              textDisplayRef.current
            ) {
              const firstCharRef = charRefs.current[0];
              if (firstCharRef) {
                const rect = firstCharRef.getBoundingClientRect();
                const containerRect =
                  textDisplayRef.current.getBoundingClientRect();
                return (
                  <Caret
                    key={p.client.id}
                    top={rect.top - containerRect.top}
                    left={rect.left - containerRect.top}
                    height={rect.height}
                    color="gray-400"
                  />
                );
              }
            } else if (
              p.current_position > 0 &&
              charRefs.current[p.current_position - 1] &&
              textDisplayRef.current
            ) {
              const prevCharRef = charRefs.current[p.current_position - 1];
              if (prevCharRef) {
                const rect = prevCharRef.getBoundingClientRect();
                const containerRect =
                  textDisplayRef.current.getBoundingClientRect();
                return (
                  <Caret
                    key={p.client.id}
                    top={rect.top - containerRect.top}
                    left={rect.right - containerRect.left}
                    height={rect.height}
                    color="gray-400"
                  />
                );
              }
            }
            return null;
          })}
    </div>
  );
};
