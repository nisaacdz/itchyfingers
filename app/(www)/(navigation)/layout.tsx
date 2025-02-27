"use client";
import NavBar from "@/components/custom/NavBar";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NuqsAdapter>
      <main className="">
        <header className="sticky top-0 left-0">
          <NavBar />
        </header>
        <main>{children}</main>
      </main>
    </NuqsAdapter>
  );
}
