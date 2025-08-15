/* eslint-disable react-refresh/only-export-components */
import httpService from "@/api/httpService";
import { AuthSchema, UserSchema } from "@/types/api";
import {
  ReactNode,
  useContext,
  useEffect,
  useState,
  createContext,
} from "react";

export interface AuthContextType {
  user: UserSchema | null;
  isLoading: boolean;
  reload: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserSchema | null>>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserSchema | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async (): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);
      const response =
        await httpService.get<AuthSchema>("/auth/me");

      if (response.data.success) {
        setUser(response.data.data?.user || null);
      } else {
        throw new Error(response.data.message || "Failed to fetch user data");
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setUser(null);
      setError(
        (error instanceof Error && error.message) ||
          "Failed to fetch user data",
      );
    } finally {
      setIsLoading(false);
    }
  };
  const reload = async (): Promise<void> => {
    await fetchUserData();
  };

  useEffect(() => {
    const initializeAuth = async () => {
      await fetchUserData();
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        reload,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
