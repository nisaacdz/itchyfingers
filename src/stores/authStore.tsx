import { create } from "zustand";
import httpService from "@/api/httpService";
import { AuthSchema, UserSchema } from "@/types/api";

export interface AuthState {
  user: UserSchema | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  setUser: (user: UserSchema | null) => void;
  fetchUserData: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...initialState,

  setUser: (user) => set({ user }),

  fetchUserData: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await httpService.get<AuthSchema>("/auth/me");

      if (response.data.success) {
        set({ user: response.data.data?.user || null });
      } else {
        throw new Error(response.data.message || "Failed to fetch user data");
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      set({
        user: null,
        error:
          (error instanceof Error && error.message) ||
          "An unknown error occurred",
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export const reloadAuth = () => useAuthStore.getState().fetchUserData();

useAuthStore.getState().fetchUserData();
