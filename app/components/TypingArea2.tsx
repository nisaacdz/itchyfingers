import { use, useEffect, useRef, useState } from "react";
import { UserProgress } from "../types/request";
import Caret from "./Caret";
import { handleKeyPress } from "../dummy_api";

type TypingAreaProps = {
    text: string,
    participants: UserProgress[],
    userProgress: UserProgress
}

const TypingArea = ({ text, participants, userProgress }: TypingAreaProps) => {
    const [posReached, setPosReached] = useState(0);
    const paragraphRef = useRef<HTMLParagraphElement>(null);
    useEffect(() => {
        const onKeyPress = (e: KeyboardEvent) => {
            setPosReached(posReached => {
                if (e.key === 'Backspace') {
                  const pos = handleKeyPress('\b')
                  return Math.max(posReached - 1, pos);
                } else if (e.key.length === 1) {
                  handleKeyPress(e.key);
                  return posReached + 1
                } else {
                  return posReached;
                }
            });
        }
        window.addEventListener("keydown", onKeyPress);
        return () => {
            window.removeEventListener("keydown", onKeyPress);
        }
    }, []);

    const caretElements = participants.map((participant, index) => {
        if (!paragraphRef.current) {
            return null;
        }
        const absPos = computeAbsolutePosition(paragraphRef, participant.currentPos);
        return <Caret key={index} styles={{...absPos, position: 'absolute', height: 32 }} />
    });

    return (
        <div className="relative w-full h-full">
            {caretElements}
            <p className="text-2xl font-medium text-gray-400 font-courier-prime w-full h-full" ref={paragraphRef}>
                <span className="text-yellow-600">{text.slice(0, userProgress.currentPos)}</span>
                <span className="text-red-600">{text.slice(userProgress.currentPos, posReached)}</span>
                {text.slice(posReached)}
            </p>
        </div>
    );
}

function computeAbsolutePosition(paragraphRef: React.RefObject<HTMLParagraphElement | null>, pos: number) {
    if (!paragraphRef.current) {
      return { top: 0, left: 0 };
    }
  
    const paragraphNode = paragraphRef.current;
  
    // Find the text node within the paragraph
    const textNode = findTextNode(paragraphNode);
  
    if (!textNode) {
      return { top: 0, left: 0 };
    }
  
    // Ensure the position is within bounds
    const textLength = textNode.textContent?.length || 0;
    const charIndex = Math.min(pos, textLength - 1);
  
    // Create a range encompassing the nth character
    const range = document.createRange();
    range.setStart(textNode, charIndex);
    range.setEnd(textNode, charIndex + 1);
  
    // Get the bounding rectangle
    const rect = range.getBoundingClientRect();
  
    // Get the paragraph's position relative to the parent container
    const paragraphRect = paragraphNode.getBoundingClientRect();
    const containerRect = paragraphNode.offsetParent?.getBoundingClientRect() || { top: 0, left: 0 };
  
    // Calculate position relative to the container
    const top = rect.top - containerRect.top;
    const left = rect.left - containerRect.left;
  
    return { top, left };
  }  

  function findTextNode(node: Node): Text | null {
    if (node.nodeType === Node.TEXT_NODE) {
      return node as Text;
    }
    for (const child of node.childNodes) {
      const textNode = findTextNode(child);
      if (textNode) {
        return textNode;
      }
    }
    return null;
  }
  

export default TypingArea;