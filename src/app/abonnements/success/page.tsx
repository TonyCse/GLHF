// Page de succes d'abonnement.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getPaypalSubscription } from "@/lib/paypal";

export const metadata: Metadata = {
  title: "Abonnement confirmé | GLHF",
  description: "Votre abonnement GLHF a été activé avec succès.",
};

type Props = {
  searchParams: Promise<{
    subscription_id?: string;
    token?: string;
    ba_token?: string;
  }>;
};

// Finalise l'abonnement et affiche la confirmation
export default async function SuccessPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/connexion");
  }

  // On resolve les query params avant de les lire
  const params = await searchParams;
  const subscriptionId = params.subscription_id || params.ba_token || params.token;

  if (!subscriptionId) {
    redirect("/abonnements?error=missing_subscription");
  }

  try {
    const subscription = await getPaypalSubscription(subscriptionId);
    const status = subscription?.status as string | undefined;

    if (status !== "ACTIVE" && status !== "APPROVED") {
      redirect("/abonnements?error=subscription_status");
    }

    const plan = await prisma.plan.findFirst({
      where: { paypalPlanId: subscription?.plan_id },
    });

    if (!plan) {
      redirect("/abonnements?error=plan");
    }

    await prisma.user.update({
      where: { id: Number(session.user.id) },
      data: {
        planId: plan.id,
        tokensUsedThisMonth: 0,
        tokensMonthStart: new Date(),
        paypalSubscriptionId: subscription.id,
      },
    });

    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold mb-4">Forfait activé 🎉</h1>
        <p className="text-white mb-6">Ton nouveau forfait GLHF est maintenant actif.</p>
        <Link
          href="/"
          className="rounded-xl bg-[#8F60D0] px-6 py-3 font-semibold hover:bg-[#a27ae0] transition"
        >
          Retour à l&apos;accueil
        </Link>
      </main>
    );
  } catch {
    redirect("/abonnements?error=unknown");
  }
}
