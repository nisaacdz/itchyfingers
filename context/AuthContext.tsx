import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  PropsWithChildren,
} from "react";
import { User } from "../types/request";
import { getCurrentUser, logoutUser } from "../api/requests";
import { delay } from "@/util";

interface AuthContextType {
  user: User | null;
  login: () => void;
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

  const reload = () => {
    setLoading(true);
    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const login = async () => {
    setLoading(true);
    const currentUser = await getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      window.location.href = "/auth/login";
    }
    // testing loader
    await delay(60000);
    setLoading(false);
  };

  const logout = () => {
    setLoading(true);
    logoutUser()
      .then(() => setUser(null))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const value = { user, login, logout, loading, reload };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthContextProvider");
  }
  return context;
};
