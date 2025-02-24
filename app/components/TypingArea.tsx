import { useEffect, useRef, useState } from "react";
import { Caret, WhiteSpaceErrorHighlight } from "./Elems";
import { Participant } from "../types/request";
import useParagraphStyles from "../hooks/useParagraphStyles";

type TypingAreaProps = {
  text: string;
  participants: Record<string, Participant>;
  userId: string;
  handleCharacterInput: (char: string) => void;
};

export const TypingArea = ({
  text,
  participants,
  userId,
  handleCharacterInput,
}: TypingAreaProps) => {
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const { fontSize } = useParagraphStyles(paragraphRef);

  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Backspace") {
        handleCharacterInput("\b");
      } else if (e.key.length === 1) {
        handleCharacterInput(e.key);
      }
    };
    window.addEventListener("keydown", onKeyPress);
    return () => {
      window.removeEventListener("keydown", onKeyPress);
    };
  }, []);

  const userParticipant = participants[userId];

  if (!userParticipant) {
    return null;
  }

  const caretElements = Object.values(participants).map((participant, index) => {
    if (!paragraphRef.current) {
      return null;
    }
    const caretPos = participant.currentPosition;
    const absPos = computeAbsolutePosition(paragraphRef, caretPos);
    return (
      <Caret
        key={index}
        styles={{
          ...absPos,
          position: "absolute",
          zIndex: 10,
          height: fontSize,
          opacity: participant.userId == userParticipant.userId ? 1 : 0.25,
        }}
      />
    );
  });

  const whiteSpaceErrorHighlights = paragraphRef.current
    ? Array.from(
        { length: userParticipant.currentPosition - userParticipant.correctPosition },
        (_, i) => userParticipant.correctPosition + i,
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

  return (
    <div className="relative w-full h-full mb-8">
      {caretElements}
      {whiteSpaceErrorHighlights}
      <p
        className="text-2xl font-medium text-muted-foreground font-courier-prime w-full h-full select-none"
        ref={paragraphRef}
      >
        <span className="text-yellow-600">
          {text.slice(0, userParticipant.correctPosition)}
        </span>
        <span className="text-red-600">
          {text.slice(userParticipant.correctPosition, userParticipant.currentPosition)}
        </span>
        {text.slice(userParticipant.currentPosition)}
      </p>
    </div>
  );
};

export const TypingAreaCountdown = ({ scheduledAt }: { scheduledAt: Date }) => {
  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      return Math.max(0, scheduledAt.getTime() - now.getTime());
    };

    setTimeLeftMs(calculateTimeLeft());

    const intervalId = setInterval(() => {
      setTimeLeftMs((prev) => {
        if (prev === null || prev <= 0) return 0;
        return Math.max(0, prev - 1000);
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [scheduledAt]);

  const formatTime = (ms: number): string => {
    if (ms >= 48 * 60 * 60 * 1000) {
      const days = Math.floor(ms / (24 * 60 * 60 * 1000));
      return `${days} day${days !== 1 ? "s" : ""}`;
    }

    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);

    if (ms < 60 * 60 * 1000) {
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative w-full h-full mb-8 flex justify-center items-center">
      <p className="text-6xl text-muted-foreground font-bold">
        {formatTime(timeLeftMs ? Math.max(0, timeLeftMs) : 0)}
      </p>
    </div>
  );
};

function computeAbsolutePosition(
  paragraphRef: React.RefObject<HTMLParagraphElement | null>,
  pos: number,
) {
  if (!paragraphRef.current) {
    return { top: 0, left: 0 };
  }

  const paragraphNode = paragraphRef.current;
  const textNodes = getAllTextNodes(paragraphNode);
  let cumulativeLength = 0;
  let targetNode: Text | null = null;
  let offset = 0;

  // Find which text node contains the target position
  for (const node of textNodes) {
    const nodeLength = node.textContent?.length || 0;
    if (pos <= cumulativeLength + nodeLength) {
      targetNode = node;
      offset = pos - cumulativeLength;
      break;
    }
    cumulativeLength += nodeLength;
  }

  if (!targetNode || offset < 0) {
    return { top: 0, left: 0 };
  }

  // Create range for the target position
  const range = document.createRange();
  const clampedOffset = Math.min(offset, targetNode.length);
  range.setStart(targetNode, clampedOffset);
  range.collapse(true);

  // Get bounding rectangle relative to container
  const rect = range.getBoundingClientRect();
  const containerRect = paragraphNode.offsetParent?.getBoundingClientRect() || {
    top: 0,
    left: 0,
  };

  return {
    top: rect.top - containerRect.top,
    left: rect.left - containerRect.left,
  };
}

function getAllTextNodes(node: Node): Text[] {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
  let current: Node | null = walker.nextNode();

  while (current) {
    textNodes.push(current as Text);
    current = walker.nextNode();
  }

  return textNodes;
}
