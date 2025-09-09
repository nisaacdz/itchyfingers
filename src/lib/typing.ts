/**
 * Computes the absolute position (top, left) of a character at a given string index
 * within a rendered paragraph element. It accounts for text wrapping and different
 * character widths within the paragraph's text nodes.
 *
 * @param paragraphRef - React ref to the HTMLParagraphElement containing the text.
 * @param charIndex - The zero-based index of the character in the paragraph's full text content.
 * @returns An object { top: number, left: number } representing the position relative
 *          to the paragraph's offsetParent, or { top: 0, left: 0 } if computation fails.
 */
export function computeAbsolutePosition(
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

/**
 * Retrieves all Text nodes within a given DOM Node using a TreeWalker.
 * @param node - The root DOM Node to traverse.
 * @returns An array of Text nodes found within the given node.
 */
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

/**
 * The state of the user's typing progress.
 */
export type TypingState = {
  correctPosition: number;
  currentPosition: number;
  totalKeystrokes: number;
};

/**
 * Processes a single character input against the current typing state and the challenge text
 * to produce the next state. This function is a pure, client-side mirror of the
 * backend's single-character processing logic.
 *
 * @param currentState - The current typing state.
 * @param character - The character that was typed (e.g., "a", " ", or "\b" for backspace).
 * @param challengeText - The full text of the typing challenge.
 * @returns The next TypingState after applying the character.
 */
export function calculateNextTypingState(
  currentState: TypingState,
  character: string,
  challengeText: string,
): TypingState {
  // Create a mutable copy of the state
  let { correctPosition, currentPosition, totalKeystrokes } = {
    ...currentState,
  };
  const textLen = challengeText?.length ?? 0;

  if (correctPosition >= textLen) {
    // Already finished, no changes needed
    return { correctPosition, currentPosition, totalKeystrokes };
  }

  if (character === "\b") {
    // Handle backspace
    if (currentPosition > correctPosition) {
      currentPosition -= 1;
    } else if (currentPosition === correctPosition && currentPosition > 0) {
      // Only allow backspacing over non-space characters when correct
      if (challengeText[currentPosition - 1] !== " ") {
        correctPosition -= 1;
        currentPosition -= 1;
      }
    }
    // Note: Backspace does not count towards totalKeystrokes
  } else {
    // Handle a regular character
    totalKeystrokes += 1;

    if (currentPosition < textLen) {
      const expectedChar = challengeText[currentPosition];
      if (currentPosition === correctPosition && character === expectedChar) {
        // Correct character typed
        correctPosition += 1;
      }
      // Always advance the cursor
      currentPosition += 1;
    }
  }

  return { correctPosition, currentPosition, totalKeystrokes };
}
