import type { Metadata } from "next";
import "./globals.css";

import AppThemeProvider from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "Jeff Systems",
  description: "Jeff Systems Billing Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}