import { RefObject, useEffect, useState } from "react";

export type ParagraphStyles = {
    fontSize: number;
    lineHeight: number;
    lineSpacing: number;
}

export const useParagraphStyles = (
  elementRef: RefObject<HTMLParagraphElement | null>,
): ParagraphStyles => {
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

    updateStyles();

    const resizeObserver = new ResizeObserver(updateStyles);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [elementRef]);

  return styles;
}
