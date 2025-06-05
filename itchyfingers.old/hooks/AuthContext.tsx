"use client";
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  PropsWithChildren,
} from "react";
import { Client } from "@/types/request";
import { getCurrentUser, logoutUser } from "../api/requests";

interface AuthContextType {
  client: Client | null;
  logout: () => void;
  loading: boolean;
  reload: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    getCurrentUser()
      .then(setClient)
      .finally(() => setLoading(false));

    console.log("User is : ", client);
  };

  useEffect(() => {
    reload();
  }, []);

  const logout = () => {
    setLoading(true);
    logoutUser()
      .then(() => setClient(null))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const value = { client, logout, loading, reload };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthContextProvider");
  }
  return context;
};
