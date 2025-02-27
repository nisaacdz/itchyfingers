"use client";
import NavBar from "@/components/custom/NavBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="">
      <header className="sticky top-0 left-0">
        <NavBar />
      </header>
      <main>{children}</main>
    </main>
  );
}
