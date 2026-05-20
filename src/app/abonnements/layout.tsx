import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abonnements – GLHF",
  description: "Découvrez nos offres d'abonnement GLHF pour obtenir plus de jetons et créer davantage de tournois.",
};

export default function AbonnementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
