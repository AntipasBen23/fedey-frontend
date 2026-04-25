import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AutopilotProvider } from "./context/AutopilotContext";
import { Header } from "./components/Header";
import SessionWrapper from "./components/SessionWrapper";
import { AuthProvider } from "@/context/AuthContext";
import InactivityGuard from "@/components/InactivityGuard";
import PageTracker from "@/components/PageTracker";
import { DialogProvider } from "@/context/DialogContext";

export const metadata: Metadata = {
  title: "Furci.ai",
  description: "Hire an AI social media manager for X and LinkedIn",
  icons: { icon: "/furciai-logo.png", apple: "/furciai-logo.png" },
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          <AuthProvider>
            <DialogProvider>
              <AutopilotProvider>
                <InactivityGuard />
                <Suspense><PageTracker /></Suspense>
                <Header />
                {children}
              </AutopilotProvider>
            </DialogProvider>
          </AuthProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
