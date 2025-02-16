import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  PropsWithChildren,
} from "react";
import { User } from "../types/request";
import { getCurrentUser, logoutUser, loginUser } from "../api";

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const login = () => {
    setLoading(true);
    getCurrentUser()
      .then((cUser) => cUser || loginUser())
      .then(setUser)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const logout = () => {
    setLoading(true);
    logoutUser()
      .then(setUser)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const value = { user, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthContextProvider");
  }
  return context;
};
