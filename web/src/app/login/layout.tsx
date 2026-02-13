import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your AQUAXONE account to track your aquarium parameters, maintenance schedules, and tank health.",
  alternates: { canonical: "https://aquaxone.app/login" },
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
