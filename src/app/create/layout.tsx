import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creer un tournoi | GLHF",
  description:
    "Creez un tournoi GLHF en quelques minutes: jeu, date, joueurs et description, puis partagez-le a la communaute.",
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
