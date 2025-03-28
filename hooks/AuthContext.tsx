"use client";
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  PropsWithChildren,
} from "react";
import { User } from "../types/request";
import { getCurrentUser, logoutUser } from "../api/requests";

interface AuthContextType {
  user: User | null;
  update: (user: User) => void;
  logout: () => void;
  loading: boolean;
  reload: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const update = (user: User) => {
    setUser(user);
  };

  const reload = () => {
    setLoading(true);
    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const logout = () => {
    setLoading(true);
    logoutUser()
      .then(() => setUser(null))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const value = { user, update, logout, loading, reload };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthContextProvider");
  }
  return context;
};
