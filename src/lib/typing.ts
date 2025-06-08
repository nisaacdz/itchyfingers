// @/components/tournament/utils/typingArenaUtils.ts

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
  charIndex: number,
): { top: number; left: number } {
  if (!paragraphRef.current || charIndex < 0) {
    return { top: 0, left: 0 };
  }

  const paragraphNode = paragraphRef.current;

  // If charIndex is 0, position is at the start of the paragraph
  if (charIndex === 0) {
    const rect = paragraphNode.getBoundingClientRect();
    const containerRect =
      paragraphNode.offsetParent?.getBoundingClientRect() || {
        top: 0,
        left: 0,
      };
    // Get padding of the paragraph itself to offset
    const computedStyle = window.getComputedStyle(paragraphNode);
    const paddingTop = parseFloat(computedStyle.paddingTop);
    const paddingLeft = parseFloat(computedStyle.paddingLeft);

    return {
      top: rect.top - containerRect.top + paddingTop,
      left: rect.left - containerRect.left + paddingLeft,
    };
  }

  const textNodes = getAllTextNodes(paragraphNode);
  let cumulativeLength = 0;
  let targetNode: Text | null = null;
  let offsetInNode = 0;

  for (const node of textNodes) {
    const nodeLength = node.textContent?.length || 0;
    if (charIndex <= cumulativeLength + nodeLength) {
      targetNode = node;
      offsetInNode = charIndex - cumulativeLength;
      break;
    }
    cumulativeLength += nodeLength;
  }

  // Handle case where charIndex might be at the very end (after the last character)
  // which means it's effectively at the end of the last text node.
  if (!targetNode && charIndex === cumulativeLength && textNodes.length > 0) {
    targetNode = textNodes[textNodes.length - 1];
    offsetInNode = targetNode.textContent?.length || 0;
  }

  if (!targetNode) {
    // If charIndex is beyond the text content, try to position at the end of the last known character
    // This might happen if current_position temporarily exceeds text length during fast typing.
    // Default to end of paragraph if no text nodes or other issues.
    if (textNodes.length > 0) {
      targetNode = textNodes[textNodes.length - 1];
      offsetInNode = targetNode.textContent?.length || 0;
    } else {
      // Fallback for an empty paragraph or other edge cases
      const rect = paragraphNode.getBoundingClientRect();
      const containerRect =
        paragraphNode.offsetParent?.getBoundingClientRect() || {
          top: 0,
          left: 0,
        };
      return {
        top: rect.top - containerRect.top,
        left:
          rect.left -
          containerRect.left +
          (paragraphNode.textContent?.length || 0 > 0
            ? paragraphNode.offsetWidth
            : 0), // Approx end
      };
    }
  }

  const range = document.createRange();
  // Ensure offsetInNode is within the bounds of the targetNode's text content
  const clampedOffset = Math.max(0, Math.min(offsetInNode, targetNode.length));

  try {
    range.setStart(targetNode, clampedOffset);
    range.collapse(true); // Collapse to the start point
  } catch (e) {
    console.error("Error setting range for caret position:", e, {
      charIndex,
      nodeLength: targetNode.length,
      clampedOffset,
    });
    // Fallback if range setting fails, e.g. position at the start of the paragraph.
    return { top: 0, left: 0 };
  }

  const rect = range.getBoundingClientRect();
  const containerRect = paragraphNode.offsetParent?.getBoundingClientRect() || {
    top: 0,
    left: 0,
  };

  // Adjust for the paragraph's own padding if its offsetParent is not itself
  let paddingTop = 0;
  let paddingLeft = 0;
  if (paragraphNode.offsetParent !== paragraphNode) {
    const computedStyle = window.getComputedStyle(paragraphNode);
    paddingTop = parseFloat(computedStyle.paddingTop);
    paddingLeft = parseFloat(computedStyle.paddingLeft);
  }

  return {
    top: rect.top - containerRect.top + paddingTop,
    left: rect.left - containerRect.left + paddingLeft,
  };
}

/**
 * Retrieves all Text nodes within a given DOM Node using a TreeWalker.
 * @param node - The root DOM Node to traverse.
 * @returns An array of Text nodes found within the given node.
 */
function getAllTextNodes(node: Node): Text[] {
  const textNodes: Text[] = [];
  // NodeFilter.SHOW_TEXT is a bitmask for TreeWalker to only visit Text nodes.
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
  let currentNode: Node | null;
  while ((currentNode = walker.nextNode())) {
    textNodes.push(currentNode as Text);
  }
  return textNodes;
}

/**
 * Creates a highlight element for a whitespace character that was typed incorrectly.
 * This is a conceptual function; actual implementation might involve rendering
 * a specific React component or directly manipulating the DOM.
 * @param position - The { top, left } position where the highlight should appear.
 * @param charWidth - The approximate width of a character in the current font.
 * @param charHeight - The approximate height (line height) of a character.
 */
export function createWhiteSpaceErrorHighlightStyle(
  position: { top: number; left: number },
  charWidth: number,
  charHeight: number,
): React.CSSProperties {
  return {
    position: "absolute",
    top: `${position.top}px`,
    left: `${position.left}px`,
    width: `${charWidth}px`,
    height: `${charHeight}px`,
    backgroundColor: "rgba(255, 0, 0, 0.3)", // Example: semi-transparent red
    borderRadius: "2px",
    zIndex: 5, // Below carets but above text
  };
}
