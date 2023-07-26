import { cn } from "@/lib/utils";

import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Spine Converter 3.8",
    template: `%s - Spine Converter 3.8`,
  },
  description: "Effortlessly upgrade Spine files to version 3.8",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "dark min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <Toaster />
        {children}
      </body>
    </html>
  );
}
