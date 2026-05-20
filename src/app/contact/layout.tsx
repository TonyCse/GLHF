import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | GLHF",
  description: "Contactez l'équipe GLHF pour toute question ou suggestion.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
