import { create } from "zustand";
import {
  TournamentSchema,
  TypingSessionSchema,
  StandingEntry,
} from "../types/api";

interface TournamentState {
  currentTournament: TournamentSchema | null;
  participants: TypingSessionSchema[];
  standings: StandingEntry[];
  isConnected: boolean;
  loading: boolean;
  error: string | null;
}

interface TournamentActions {
  setCurrentTournament: (tournament: TournamentSchema | null) => void;
  setParticipants: (participants: TypingSessionSchema[]) => void;
  updateParticipant: (participant: TypingSessionSchema) => void;
  setStandings: (standings: StandingEntry[]) => void;
  setConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useTournamentStore = create<TournamentState & TournamentActions>(
  (set, get) => ({
    currentTournament: null,
    participants: [],
    standings: [],
    isConnected: false,
    loading: false,
    error: null,

    setCurrentTournament: (tournament) =>
      set((state) => ({ ...state, currentTournament: tournament })),

    setParticipants: (participants) =>
      set((state) => ({ ...state, participants })),

    updateParticipant: (participant) =>
      set((state) => {
        const existingIndex = state.participants.findIndex(
          (p) => p.user.id === participant.user.id,
        );

        if (existingIndex >= 0) {
          const newParticipants = [...state.participants];
          newParticipants[existingIndex] = participant;
          return { ...state, participants: newParticipants };
        } else {
          return {
            ...state,
            participants: [...state.participants, participant],
          };
        }
      }),

    setStandings: (standings) => set((state) => ({ ...state, standings })),

    setConnected: (connected) =>
      set((state) => ({ ...state, isConnected: connected })),

    setLoading: (loading) => set((state) => ({ ...state, loading })),

    setError: (error) => set((state) => ({ ...state, error })),

    clearError: () => set((state) => ({ ...state, error: null })),

    reset: () =>
      set({
        currentTournament: null,
        participants: [],
        standings: [],
        isConnected: false,
        loading: false,
        error: null,
      }),
  }),
);
