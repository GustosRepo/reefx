import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - Plans & Features",
  description: "Choose the perfect AQUAXONE plan for your aquarium. Free tier with 1 tank, Premium with 3 tanks and gallery, or Super Premium with equipment tracking, livestock management, and up to 5 tanks.",
  alternates: { canonical: "https://aquaxone.app/pricing" },
  openGraph: {
    title: "AQUAXONE Pricing - Plans & Features",
    description: "Free, Premium, and Super Premium plans for every aquarium hobbyist. Start tracking for free.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
