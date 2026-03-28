import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
