import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn - Aquarium Guides & Tips",
  description: "Expert guides on reef keeping, freshwater aquariums, water chemistry, coral care, and equipment. Learn everything about maintaining a healthy aquarium.",
  alternates: { canonical: "https://aquaxone.app/learn" },
  openGraph: {
    title: "AQUAXONE Guides - Aquarium Tips & Tutorials",
    description: "Expert guides on reef keeping, freshwater tanks, water chemistry, and aquarium maintenance.",
  },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
