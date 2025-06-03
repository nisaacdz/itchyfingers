import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserSchema, ClientSchema } from "../types/apiTypes";

interface AuthState {
  user: UserSchema | null;
  client: ClientSchema | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: UserSchema | null) => void;
  setClient: (client: ClientSchema | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      client: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      setUser: (user) =>
        set((state) => ({
          ...state,
          user,
          isAuthenticated: !!user,
        })),

      setClient: (client) =>
        set((state) => ({
          ...state,
          client,
          isAuthenticated: client?.is_authenticated || false,
        })),

      setLoading: (loading) => set((state) => ({ ...state, loading })),

      setError: (error) => set((state) => ({ ...state, error })),

      logout: () =>
        set({
          user: null,
          client: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        }),

      clearError: () => set((state) => ({ ...state, error: null })),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        client: state.client,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
