import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Données personnelles | GLHF",
  description: "Exercez vos droits RGPD et contactez le DPO de GLHF.",
};

export default function DonneesPersonnellesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
