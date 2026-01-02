import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { TankProvider } from "@/context/TankContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#06b6d4",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://reefxone.app"),
  title: "REEFXONE - Reef Aquarium Tracking",
  description: "Track your reef aquarium parameters, maintenance, and trends with smart alerts. The ultimate app for reef hobbyists.",
  keywords: ["reef aquarium", "coral tracking", "water parameters", "reef tank", "alkalinity", "calcium", "magnesium"],
  authors: [
    { name: "REEFXONE" },
    { name: "CODEWERX", url: "https://www.code-werx.com/" },
  ],
  creator: "CODEWERX",
  publisher: "CODEWERX",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "REEFXONE",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://reefxone.app",
    siteName: "REEFXONE",
    title: "REEFXONE - Reef Aquarium Tracking",
    description: "Track your reef aquarium parameters, maintenance, and trends with smart alerts.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "REEFXONE - Reef Aquarium Tracking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "REEFXONE - Reef Aquarium Tracking",
    description: "Track your reef aquarium parameters, maintenance, and trends with smart alerts.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8863066373093222"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <SubscriptionProvider>
          <TankProvider>
            {children}
          </TankProvider>
        </SubscriptionProvider>
      </body>
    </html>
  );
}
