"use client";

import React, {
  createContext,
  useState,
  useContext,
  PropsWithChildren,
} from "react";
import { User, DefaultUserTyping, Participant } from "@/app/types/request";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  userParticipant: Participant | null;
  setUserTyping: (userParticipant: Participant | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userParticipant, setUserTyping] = useState<Participant | null>(
    DefaultUserTyping,
  );

  const value: UserContextType = {
    user,
    setUser,
    userParticipant,
    setUserTyping,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return context;
};
