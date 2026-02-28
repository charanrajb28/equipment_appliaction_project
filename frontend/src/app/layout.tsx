import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EquipTrack — Equipment Management System",
  description:
    "Manage equipment, track maintenance history, and monitor asset health with EquipTrack.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <TooltipProvider>
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <footer className="mt-16 border-t py-6">
            <p className="text-center text-xs text-muted-foreground">
              EquipTrack © {new Date().getFullYear()} — Equipment Management System
            </p>
          </footer>
        </TooltipProvider>
      </body>
    </html>
  );
}
