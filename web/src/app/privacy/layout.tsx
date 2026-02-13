import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "AQUAXONE privacy policy. Learn how we collect, use, and protect your aquarium tracking data.",
  alternates: { canonical: "https://aquaxone.app/privacy" },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
