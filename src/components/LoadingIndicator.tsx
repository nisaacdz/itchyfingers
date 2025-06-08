import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  text?: string;
  size?: number;
  className?: string;
}

export const LoadingIndicator = ({
  text = "Loading...",
  size = 24,
  className = "",
}: LoadingIndicatorProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 text-muted-foreground ${className}`}
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="animate-spin" size={size} />
      {text && <p className="text-sm">{text}</p>}
    </div>
  );
};