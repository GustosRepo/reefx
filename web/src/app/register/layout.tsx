import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your free AQUAXONE account and start tracking your aquarium parameters, maintenance, and tank health today.",
  alternates: { canonical: "https://aquaxone.app/register" },
  robots: { index: false, follow: true },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
