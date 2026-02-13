import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "AQUAXONE terms of service. Read our terms for using the aquarium tracking platform.",
  alternates: { canonical: "https://aquaxone.app/terms" },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
