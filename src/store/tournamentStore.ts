import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  TournamentSchema,
  TypingSessionSchema,
  TournamentSession,
  ClientSchema, // Ensured this is the correct, updated ClientSchema
} from "../types/api";

interface TournamentState {
  tournaments: TournamentSchema[];
  currentTournament: TournamentSchema | null;
  liveTournamentSession: TournamentSession | null;
  participants: Record<string, TypingSessionSchema>; // Changed to Record
  loading: boolean;
  error: string | null;
}

// Define actions separately for better organization if needed, or inline as before
interface TournamentActions {
  setTournaments: (tournaments: TournamentSchema[]) => void;
  setCurrentTournament: (tournament: TournamentSchema | null) => void;
  setLiveTournamentSession: (session: TournamentSession | null) => void;
  setParticipants: (participantsArray: TypingSessionSchema[]) => void;
  updateParticipant: (updatedParticipant: TypingSessionSchema) => void;
  removeParticipant: (clientId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetCurrentTournament: () => void;
  // addParticipant: (participant: TypingSessionSchema) => void; // If direct add is still needed
}

export const useTournamentStore = create<TournamentState & TournamentActions>()(
  devtools(
    persist(
      (set) => ({
        tournaments: [],
        currentTournament: null,
        liveTournamentSession: null,
        participants: {},
        loading: false,
        error: null,

        setTournaments: (tournaments) => set({ tournaments, loading: false, error: null }),
        setCurrentTournament: (tournament) =>
          set({ currentTournament: tournament, loading: false, error: null }),
        setLiveTournamentSession: (session) =>
          set({ liveTournamentSession: session }),
        
        setParticipants: (participantsArray) => 
          set({
            participants: participantsArray.reduce((acc, p) => {
              acc[p.client.id] = p;
              return acc;
            }, {} as Record<string, TypingSessionSchema>)
          }),
        
        updateParticipant: (updatedParticipant) =>
          set((state) => ({
            participants: {
              ...state.participants,
              [updatedParticipant.client.id]: updatedParticipant,
            },
          })),

        removeParticipant: (clientId) =>
          set((state) => {
            const newParticipants = { ...state.participants };
            delete newParticipants[clientId];
            return { participants: newParticipants };
          }),
        
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error, loading: false }),
        resetCurrentTournament: () =>
          set({
            currentTournament: null,
            liveTournamentSession: null,
            participants: {},
            error: null,
          }),
      }) satisfies TournamentState & TournamentActions, // Ensures all actions and state are covered
      {
        name: "tournament-storage",
        partialize: (state) => ({
          tournaments: state.tournaments,
          currentTournament: state.currentTournament,
          // Persisting participants might be okay, but liveTournamentSession is volatile
          // participants: state.participants, 
        }),
      },
    ),
  ),
);

// Selector to get the current user's participant data
export const selectMyParticipantData = (
  state: TournamentState,
  authClientId: string | undefined,
): TypingSessionSchema | undefined => {
  if (!authClientId) return undefined;
  return state.participants[authClientId];
};

// Selector to get other participants as an array
export const selectOtherParticipantsArray = (
  state: TournamentState,
  myAuthClientId: string | undefined,
): TypingSessionSchema[] => {
  return Object.values(state.participants).filter(
    (p) => p.client.id !== myAuthClientId
  );
};

// Selector to get all participants as an array
export const selectAllParticipantsArray = (state: TournamentState): TypingSessionSchema[] => {
  return Object.values(state.participants);
};
