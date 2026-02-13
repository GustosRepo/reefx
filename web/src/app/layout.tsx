import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { TankProvider } from "@/context/TankContext";
import { AquaModeProvider } from "@/context/AquaModeContext";
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
  themeColor: "#0891b2",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://aquaxone.app"),
  title: {
    default: "AQUAXONE - Smart Aquarium Tracking",
    template: "%s | AQUAXONE",
  },
  description: "Track your reef and freshwater aquarium parameters, maintenance, and trends with smart alerts. The ultimate app for aquarium hobbyists. Powered by ReefXOne.",
  keywords: [
    "aquarium tracking",
    "reef aquarium",
    "freshwater aquarium",
    "planted tank",
    "coral tracking",
    "water parameters",
    "reef tank",
    "alkalinity",
    "calcium",
    "magnesium",
    "fish tank",
    "aquarium maintenance",
    "aquarium app",
    "reef tank app",
    "aquarium water testing",
  ],
  authors: [
    { name: "AQUAXONE" },
    { name: "CODEWERX", url: "https://www.code-werx.com/" },
  ],
  creator: "CODEWERX",
  publisher: "CODEWERX",
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://aquaxone.app",
  },
  verification: {
    google: "hCTfInox_UWBUH6XEBumTYi1XxFYLrnZhv7F5p46NO8",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AQUAXONE",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aquaxone.app",
    siteName: "AQUAXONE",
    title: "AQUAXONE - Smart Aquarium Tracking",
    description: "Track your reef and freshwater aquarium parameters, maintenance, and trends with smart alerts.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AQUAXONE - Smart Aquarium Tracking Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AQUAXONE - Smart Aquarium Tracking",
    description: "Track your reef and freshwater aquarium parameters, maintenance, and trends with smart alerts.",
    images: ["/og-image.jpg"],
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
        {/* JSON-LD: WebApplication structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "AQUAXONE",
              url: "https://aquaxone.app",
              description:
                "Track your reef and freshwater aquarium parameters, maintenance, and trends with smart alerts. The ultimate app for aquarium hobbyists.",
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "Web, iOS, Android",
              offers: [
                {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  name: "Free",
                },
                {
                  "@type": "Offer",
                  price: "4.99",
                  priceCurrency: "USD",
                  name: "Premium",
                  priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    billingDuration: "P1M",
                  },
                },
                {
                  "@type": "Offer",
                  price: "9.99",
                  priceCurrency: "USD",
                  name: "Super Premium",
                  priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    billingDuration: "P1M",
                  },
                },
              ],
              creator: {
                "@type": "Organization",
                name: "CODEWERX",
                url: "https://www.code-werx.com/",
              },
            }),
          }}
        />
        {/* JSON-LD: Organization structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "AQUAXONE",
              url: "https://aquaxone.app",
              logo: "https://aquaxone.app/og-image.jpg",
              sameAs: [],
            }),
          }}
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
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
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
        <AquaModeProvider>
          <SubscriptionProvider>
            <TankProvider>
              {children}
            </TankProvider>
          </SubscriptionProvider>
        </AquaModeProvider>
      </body>
    </html>
  );
}
