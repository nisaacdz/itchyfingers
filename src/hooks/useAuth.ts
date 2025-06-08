import httpService from "@/api/httpService";
import { AuthContext, AuthContextType } from "@/context/AuthContext";
import { ClientSchema, HttpResponse } from "@/types/api";
import { ReactNode, useContext, useEffect, useState } from "react"

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;