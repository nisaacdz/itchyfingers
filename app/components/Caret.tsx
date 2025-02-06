import { CSSProperties } from "react";

type CaretProps = {
    styles?: CSSProperties;
  }
  
const Caret: React.FC<CaretProps> = ({ styles = {} }) => {
    return (
        <div className="w-1 h-6 bg-black animate-blink bg-current" style={styles}></div>
    );
}

export default Caret;