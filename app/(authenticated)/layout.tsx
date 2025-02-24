"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContextProvider } from "../context/AuthContext";
import { ToastContainer } from "react-toastify";
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();
  return (
    <AuthContextProvider>
      <QueryClientProvider client={queryClient}>
        <ToastContainer />
          <NuqsAdapter >
            <main>{children}</main>
          </NuqsAdapter>
      </QueryClientProvider>
    </AuthContextProvider>
  );
}
