import { useEffect, useRef } from "react";
import { Caret, WhiteSpaceErrorHighlight } from "./Elems";
import { handleTypedCharacters } from "../dummy_api";
import { Participant, User } from "../types/request";
import useParagraphStyles from "../hooks/useParagraphStyles";

type TypingAreaProps = {
  text: string;
  participants: Participant[];
  user: User;
};

const TypingArea = ({ text, participants, user }: TypingAreaProps) => {
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const { fontSize } = useParagraphStyles(paragraphRef);

  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Backspace") {
        handleTypedCharacters("\b");
      } else if (e.key.length === 1) {
        handleTypedCharacters(e.key);
      }
    };
    window.addEventListener("keydown", onKeyPress);
    return () => {
      window.removeEventListener("keydown", onKeyPress);
    };
  }, []);

  const caretElements = participants.map((participant, index) => {
    if (!paragraphRef.current) {
      return null;
    }
    const caretPos =
      participant.id == user.userId ? user.currentPos : participant.correctPos;
    const absPos = computeAbsolutePosition(paragraphRef, caretPos);
    return (
      <Caret
        key={index}
        styles={{
          ...absPos,
          position: "absolute",
          zIndex: 10,
          height: fontSize,
          opacity: participant.id == user.userId ? 1 : 0.4,
        }}
      />
    );
  });

  const whiteSpaceErrorHighlights = paragraphRef.current
    ? Array.from(
        { length: user.currentPos - user.correctPos },
        (_, i) => user.correctPos + i,
      )
        .filter((pos) => text[pos] === " ")
        .map((pos) => (
          <WhiteSpaceErrorHighlight
            key={pos}
            position={computeAbsolutePosition(paragraphRef, pos)}
            height={fontSize}
            width={fontSize}
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
          {text.slice(0, user.correctPos)}
        </span>
        <span className="text-red-600">
          {text.slice(user.correctPos, user.currentPos)}
        </span>
        {text.slice(user.currentPos)}
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

export default TypingArea;
