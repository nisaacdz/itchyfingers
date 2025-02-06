import { useEffect, useState } from "react";

const TypingArea = ({text}: {text: string}) => {
    const [pos, setPos] = useState(0);
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // api call to possibly update the other participants
        }
        window.addEventListener("keypress", handleKeyPress);
        return () => {
            window.removeEventListener("keypress", handleKeyPress);
        }
    }, []);
    return (
        <div className="w-full h-full">
            <p className="text-2xl font-medium text-gray-400 font-courier-prime">
                {text}
            </p>
        </div>
    );
}

export default TypingArea;