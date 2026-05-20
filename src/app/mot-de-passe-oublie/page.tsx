import type { Metadata } from "next";
import MotDePasseOublieClient from "./mot-de-passe-oublie-client";

export const metadata: Metadata = {
  title: "Mot de passe oublié | GLHF",
  description: "Réinitialisez votre mot de passe GLHF.",
};

export default function MotDePasseOubliePage() {
  return <MotDePasseOublieClient />;
}
