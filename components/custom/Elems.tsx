import { CSSProperties } from "react";

type CaretProps = {
  styles?: CSSProperties;
};

export const Caret: React.FC<CaretProps> = ({ styles = {} }) => {
  return (
    <div
      className="w-1 h-6 bg-black animate-blink bg-current"
      style={styles}
    ></div>
  );
};

type WhiteSpaceErrorHighlightProps = {
  position: { top: number; left: number };
  width: number;
  height: number;
};

export const WhiteSpaceErrorHighlight: React.FC<
  WhiteSpaceErrorHighlightProps
> = ({ position, width, height }) => {
  return (
    <div
      key={`space-${position.top}-${position.left}`}
      className="absolute bg-red-400/50"
      style={{
        top: position.top,
        left: position.left,
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
};
