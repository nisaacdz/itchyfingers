
import { create } from 'zustand';

interface TypingState {
  currentText: string;
  currentPosition: number;
  correctPosition: number;
  totalKeystrokes: number;
  errors: number;
  startTime: Date | null;
  endTime: Date | null;
  isActive: boolean;
  currentSpeed: number;
  currentAccuracy: number;
}

interface TypingActions {
  setText: (text: string) => void;
  typeCharacter: (character: string) => void;
  start: () => void;
  finish: () => void;
  reset: () => void;
  calculateMetrics: () => void;
}

export const useTypingStore = create<TypingState & TypingActions>((set, get) => ({
  currentText: '',
  currentPosition: 0,
  correctPosition: 0,
  totalKeystrokes: 0,
  errors: 0,
  startTime: null,
  endTime: null,
  isActive: false,
  currentSpeed: 0,
  currentAccuracy: 100,

  setText: (text) => 
    set((state) => ({ ...state, currentText: text })),

  typeCharacter: (character) => {
    const state = get();
    if (!state.isActive || state.currentPosition >= state.currentText.length) return;

    const expectedChar = state.currentText[state.currentPosition];
    const isCorrect = character === expectedChar;
    
    set((prevState) => {
      const newState = {
        ...prevState,
        currentPosition: prevState.currentPosition + 1,
        totalKeystrokes: prevState.totalKeystrokes + 1,
        correctPosition: isCorrect ? prevState.correctPosition + 1 : prevState.correctPosition,
        errors: isCorrect ? prevState.errors : prevState.errors + 1,
      };

      // Calculate metrics
      const timeElapsed = prevState.startTime ? 
        (Date.now() - prevState.startTime.getTime()) / 1000 / 60 : 0;
      
      if (timeElapsed > 0) {
        const wordsTyped = newState.correctPosition / 5; // Average word length
        newState.currentSpeed = Math.round(wordsTyped / timeElapsed);
        newState.currentAccuracy = newState.totalKeystrokes > 0 ? 
          Math.round((newState.correctPosition / newState.totalKeystrokes) * 100) : 100;
      }

      // Check if finished
      if (newState.currentPosition >= newState.currentText.length) {
        newState.isActive = false;
        newState.endTime = new Date();
      }

      return newState;
    });
  },

  start: () => 
    set((state) => ({ 
      ...state, 
      isActive: true, 
      startTime: new Date(),
      endTime: null
    })),

  finish: () => 
    set((state) => ({ 
      ...state, 
      isActive: false, 
      endTime: new Date()
    })),

  reset: () => 
    set({
      currentPosition: 0,
      correctPosition: 0,
      totalKeystrokes: 0,
      errors: 0,
      startTime: null,
      endTime: null,
      isActive: false,
      currentSpeed: 0,
      currentAccuracy: 100,
    }),

  calculateMetrics: () => {
    const state = get();
    if (!state.startTime) return;

    const timeElapsed = (Date.now() - state.startTime.getTime()) / 1000 / 60;
    if (timeElapsed > 0) {
      const wordsTyped = state.correctPosition / 5;
      const speed = Math.round(wordsTyped / timeElapsed);
      const accuracy = state.totalKeystrokes > 0 ? 
        Math.round((state.correctPosition / state.totalKeystrokes) * 100) : 100;

      set((prevState) => ({
        ...prevState,
        currentSpeed: speed,
        currentAccuracy: accuracy,
      }));
    }
  },
}));
