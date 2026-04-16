import type { Metadata } from "next";
import "./globals.css";
import { AutopilotProvider } from "./context/AutopilotContext";
import { Header } from "./components/Header";
import SessionWrapper from "./components/SessionWrapper";
import { AuthProvider } from "@/context/AuthContext";
import InactivityGuard from "@/components/InactivityGuard";

export const metadata: Metadata = {
  title: "Furci.ai",
  description: "Hire an AI social media manager for X and LinkedIn",
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
            <AutopilotProvider>
              <InactivityGuard />
              <Header />
              {children}
            </AutopilotProvider>
          </AuthProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
