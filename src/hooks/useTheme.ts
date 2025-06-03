import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolvedTheme: "light" | "dark";
}

interface ThemeActions {
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set, get) => ({
      theme: "system",
      resolvedTheme: "light",

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
    }),
    {
      name: "theme-storage",
    },
  ),
);

function getSystemTheme(): "light" | "dark" {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

function applyTheme(theme: Theme) {
  const root = window.document.documentElement;

  let resolvedTheme: "light" | "dark";
  if (theme === "system") {
    resolvedTheme = getSystemTheme();
  } else {
    resolvedTheme = theme;
  }

  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);

  useThemeStore.setState({ resolvedTheme });
}

// Initialize theme on load
if (typeof window !== "undefined") {
  const { theme } = useThemeStore.getState();
  applyTheme(theme);

  // Listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      const { theme } = useThemeStore.getState();
      if (theme === "system") {
        applyTheme(theme);
      }
    });
}

export const useTheme = () => {
  const { theme, resolvedTheme, setTheme } = useThemeStore();
  return { theme, resolvedTheme, setTheme };
};
