import "./globals.css";
import type { Metadata } from "next";
import React from "react";
import { Bodoni_Moda, IBM_Plex_Sans } from "next/font/google";

const displayFont = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Salesforce M&A Screening System",
  description: "Assignment 2 M&A screening and judgment system for Salesforce corporate development.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>{children}</body>
    </html>
  );
}
