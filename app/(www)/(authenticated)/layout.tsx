"use client";
import { AuthContextProvider } from "../../../context/AuthContext";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthContextProvider>
      <NuqsAdapter>{children}</NuqsAdapter>
    </AuthContextProvider>
  );
}
