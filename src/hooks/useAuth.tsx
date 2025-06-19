/* eslint-disable react-refresh/only-export-components */
import httpService from "@/api/httpService";
import { Button } from "@/components/ui/button";
import { ClientSchema, HttpResponse } from "@/types/api";
import { Loader } from "lucide-react";
import { ReactNode, useContext, useEffect, useState, createContext } from "react";

export interface AuthContextType {
  client: ClientSchema;
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
      setError(null);
      setIsLoading(true);
      const response =
        await httpService.get<HttpResponse<ClientSchema>>("/auth/me");

      if (response.data.success) {
        setClient(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch user data");
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setClient(null);
      setError((error instanceof Error && error.message) || "Failed to fetch user data");
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

  console.log("AuthProvider initialized with client:", client);

  return (
    client ? (
      <AuthContext.Provider value={{
        client,
        isLoading,
        reload,
      }}>
        {children}
      </AuthContext.Provider>
    ) : isLoading ? (<div className="flex items-center justify-center h-screen">
      <Loader className="animate-spin h-8 w-8 text-blue-500" />
    </div>) : (
      <div className="flex items-center justify-center h-screen">
        <span className="text-lg text-red-500">
          "An error occurred while reaching the server."
        </span>

        <Button
          onClick={reload}
          className="mt-4"
          variant="outline"
        >
          Retry
        </Button>
      </div>
    )
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
