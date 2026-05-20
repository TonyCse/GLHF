import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'utilisation | GLHF",
  description: "Consultez les conditions générales d'utilisation de GLHF.",
};

export default function ConditionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
