// @/components/tournament/elements/TextRenderer.tsx
import React, { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TextRendererProps {
  text: string;
  correctPosition: number; // Index up to which text is typed correctly
  currentPosition: number; // Current caret position (includes correct + incorrect)
  paragraphRef: React.RefObject<HTMLParagraphElement>;
  className?: string;
}

export const TextRenderer = memo(
  ({ text, correctPosition, currentPosition, paragraphRef, className }: TextRendererProps) => {
    // Ensure positions are within bounds
    const safeCorrectPos = Math.max(0, Math.min(correctPosition, text.length));
    const safeCurrentPos = Math.max(safeCorrectPos, Math.min(currentPosition, text.length));

    const segments = useMemo(() => {
      const correctText = text.slice(0, safeCorrectPos);
      const incorrectText = text.slice(safeCorrectPos, safeCurrentPos);
      const upcomingText = text.slice(safeCurrentPos);
      return { correctText, incorrectText, upcomingText };
    }, [text, safeCorrectPos, safeCurrentPos]);

    if (!text) return null;

    return (
      <p
        ref={paragraphRef}
        className={cn(
          "font-courier-prime text-xl md:text-2xl leading-relaxed select-none text-left w-full whitespace-pre-wrap break-words relative focus:outline-none",
          // `whitespace-pre-wrap` respects spaces/newlines and wraps.
          // `break-words` for long non-spaced strings if `whitespace-pre-wrap` isn't enough.
          className
        )}
        tabIndex={-1} // Make it programmatically focusable if needed, but input is global
      >
        <span className="text-emerald-400/90 dark:text-emerald-300/90">{segments.correctText}</span>
        {/* For incorrect text, a subtle background helps distinguish spaces */}
        {segments.incorrectText && (
            <span className="bg-red-500/30 text-red-500 dark:text-red-400 rounded-[2px] mx-[-0.5px] px-[0.5px]">
                {segments.incorrectText.split('').map((char, idx) => (
                    // Render spaces with a visible character or specific styling if needed
                    char === ' ' ? <span key={idx} className="opacity-70">·</span> : char
                ))}
            </span>
        )}
        <span className="text-slate-400 dark:text-slate-500">{segments.upcomingText}</span>
      </p>
    );
  }
);

TextRenderer.displayName = "TextRenderer";