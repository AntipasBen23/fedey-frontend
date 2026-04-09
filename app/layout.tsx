import type { Metadata } from "next";
import "./globals.css";
import { AutopilotProvider } from "./context/AutopilotContext";
import { Header } from "./components/Header";
import SessionWrapper from "./components/SessionWrapper";

export const metadata: Metadata = {
  title: "Fedey",
  description: "Hire an AI social media manager for X and LinkedIn"
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          <AutopilotProvider>
            <Header />
            {children}
          </AutopilotProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
