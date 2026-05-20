import type { Metadata } from "next";
import ReinitialisationMotDePasseClient from "./reinitialisation-mot-de-passe-client";

export const metadata: Metadata = {
  title: "Réinitialisation du mot de passe | GLHF",
  description: "Définissez un nouveau mot de passe pour votre compte GLHF.",
};

export default async function ReinitialisationMotDePassePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <ReinitialisationMotDePasseClient token={token} />;
}
