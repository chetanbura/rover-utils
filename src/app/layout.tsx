import type { Metadata } from "next";
import "./globals.css";
import { AppHeader } from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "Rover Commands UI",
  description: "Run Rover publishing and manifest scripts from a web UI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppHeader />
        <main className="app-shell">{children}</main>
      </body>
    </html>
  );
}
