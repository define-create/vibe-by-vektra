import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { OfflineIndicator } from "@/components/shared/OfflineIndicator";

export const metadata: Metadata = {
  title: "Vibe by Vektra",
  description: "Private post-session reflection instrument",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vibe",
  },
};

export const viewport: Viewport = {
  themeColor: "#171717",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <Providers>
          <OfflineIndicator />
          {children}
        </Providers>
      </body>
    </html>
  );
}
