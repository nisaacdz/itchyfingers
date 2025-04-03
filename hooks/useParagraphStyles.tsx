import { useEffect, useState, RefObject } from "react";
import { ParagraphStyles } from "@/types/util";

function useParagraphStyles(
  elementRef: RefObject<HTMLParagraphElement | null>,
): ParagraphStyles {
  const [styles, setStyles] = useState<ParagraphStyles>({
    fontSize: 0,
    lineHeight: 0,
    lineSpacing: 0,
  });

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;

    const updateStyles = () => {
      const computedStyles = window.getComputedStyle(element);

      setStyles({
        fontSize: parseFloat(computedStyles.fontSize) ?? 0,
        lineHeight: parseFloat(computedStyles.lineHeight) ?? 0,
        lineSpacing: parseFloat(computedStyles.marginBottom) ?? 0,
      });
    };

    // Initial style retrieval
    updateStyles();

    // Observe changes to the element's styles
    const resizeObserver = new ResizeObserver(updateStyles);
    resizeObserver.observe(element);

    // Cleanup on unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, [elementRef]);

  return styles;
}

export default useParagraphStyles;
