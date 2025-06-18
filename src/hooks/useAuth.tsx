/* eslint-disable react-refresh/only-export-components */
import httpService from "@/api/httpService";
import { ClientSchema, HttpResponse } from "@/types/api";
import { ReactNode, useContext, useEffect, useState, createContext } from "react";

export interface AuthContextType {
  client: ClientSchema | null;
  isLoading: boolean;
  reload: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [client, setClient] = useState<ClientSchema | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async (): Promise<void> => {
    try {
      const response =
        await httpService.get<HttpResponse<ClientSchema>>("/auth/me");

      if (response.data.success) {
        setClient(response.data.data);
      } else {
        setClient(null);
        setError(response.data.message || "Failed to fetch user data");
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setClient(null);
      setError(error.message || "Failed to fetch user data");
    }
  };
  const reload = async (): Promise<void> => {
    await fetchUserData();
  };
  // Check authentication status on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        await fetchUserData();
      } catch (error) {
        console.error("Auth initialization failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    client,
    isLoading,
    reload,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* {error ? <ErrorMessage title="Authentication Error" message={error} /> : children} */}
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
