import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Annulation d'abonnement | GLHF",
  description: "Annulez votre abonnement GLHF.",
};

export default function CancelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
