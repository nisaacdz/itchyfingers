"use client";
import { AuthContextProvider } from "@/hooks/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { Toaster } from "sonner";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Suspense>
        <AuthContextProvider>
          <main>{children}</main>
        </AuthContextProvider>
      </Suspense>
    </QueryClientProvider>
  );
}
