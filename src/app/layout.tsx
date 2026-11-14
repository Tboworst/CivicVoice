import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavbarWrapper } from "@/components/layout/NavbarWrapper";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CivicVoice — Turning Local Voices into Local Action",
    template: "%s | CivicVoice",
  },
  description:
    "CivicVoice is a community intelligence and accountability platform for Towson University and the greater Towson, Maryland area.",
  keywords: ["Towson", "community", "civic engagement", "issues", "Towson University"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-civic-bg text-civic-text antialiased">
        <NavbarWrapper />
        <main className="pt-16 min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
