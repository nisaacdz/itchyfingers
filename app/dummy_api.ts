// Purpose: Dummy API for testing purposes.
import { ZoneData } from "./types/request";

const text = 'Ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nisl tincidunt tincidunt'

let updateStates: () => void;
const userProgress = {
    userId: "you",
    currentPos: 0,
    totalCount: 0,
    speed: 0,
};

let zoneData: ZoneData = {
    userProgress: userProgress,
    participants: [userProgress],
    challengeId: "challenge1",
    sessionId: "challenge1-session1",
}

let loading = false;
let error = false;
let startTime: Date | undefined | null;
let endTime: Date | undefined | null;
let timeSpent = 0;

export function initialize(updateFn: () => void) {
    updateStates = updateFn;
}

export function getTypingText() {
    return text;
}

export function getZoneData() {
    return zoneData;
}

export function getEverything() {
    return { zoneData: getZoneData(), loading, error };
}

export function handleKeyPress(inputString: string) {
    if (!startTime)
        startTime = new Date();
    const now = Date.now();
    const elapsedTime = startTime ? now - startTime.getTime() : 0;

    // Update total keystrokes (including corrections)
    userProgress.totalCount += inputString.length;

    let inputIndex = 0;
    while (
        userProgress.currentPos < text.length &&
        inputIndex < inputString.length &&
        (text[userProgress.currentPos] === inputString[inputIndex] || inputString[inputIndex] === '\b')
    ) {
        const currentChar = inputString[inputIndex];
        
        if (currentChar === '\b') {
            // Handle backspace: move back if previous character isn't space
            if (userProgress.currentPos > 0 && text[userProgress.currentPos - 1] !== ' ') {
                userProgress.currentPos--;
            }
        } else {
            // Advance position for correct character
            userProgress.currentPos++;
        }
        
        inputIndex++;
    }

    // Update completion state
    if (userProgress.currentPos === text.length) {
        endTime = new Date();
        timeSpent = elapsedTime;
        startTime = null;
    }

    // Calculate typing speed (words per minute)
    const wordsTyped = userProgress.totalCount / 5;
    const minutesElapsed = elapsedTime / 60000;
    userProgress.speed = minutesElapsed > 0 
        ? Math.round(wordsTyped / minutesElapsed) 
        : 0;

    updateStates();
    return userProgress.currentPos;
}