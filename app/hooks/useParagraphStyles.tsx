import { useEffect, useState, RefObject } from 'react';
import { ParagraphStyles } from '../types/util';

function useParagraphStyles(
  elementRef: RefObject<HTMLParagraphElement | null>
): ParagraphStyles | null {
  const [styles, setStyles] = useState<ParagraphStyles | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;

    const updateStyles = () => {
      const computedStyles = window.getComputedStyle(element);

      setStyles({
        fontSize: Number(computedStyles.fontSize),
        letterSpacing: Number(computedStyles.letterSpacing),
        lineHeight: Number(computedStyles.lineHeight),
        lineSpacing: Number(computedStyles.marginBottom),
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
