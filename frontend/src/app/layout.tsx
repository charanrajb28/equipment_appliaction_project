import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
      <body
        className={`${inter.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <TooltipProvider>
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <footer className="mt-16 border-t bg-muted/30">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <p className="text-center text-xs text-muted-foreground">
                <span className="gradient-text font-semibold">EquipTrack</span>
                {" "}— Equipment Management System · Built with Spring Boot & Next.js
              </p>
            </div>
          </footer>
        </TooltipProvider>
      </body>
    </html>
  );
}
