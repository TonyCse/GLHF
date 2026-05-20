import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestion des paiements – Admin GLHF",
  description: "Administration des paiements et abonnements GLHF.",
};

export default function PaiementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
