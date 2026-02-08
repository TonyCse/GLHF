// src/app/abonnements/success/page.tsx
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getPaypalSubscription } from "@/lib/paypal";

type Props = {
  // ✅ en Next 15, searchParams est une Promise
  searchParams: Promise<{
    subscription_id?: string;
    token?: string;
    ba_token?: string;
  }>;
};

export default async function SuccessPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  // ✅ on "résout" les query params avant de les lire
  const params = await searchParams;
  const subscriptionId =
    params.subscription_id || params.ba_token || params.token;

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
        <p className="text-gray-300 mb-6">
          Ton nouveau forfait GLHF est maintenant actif.
        </p>
        <a
          href="/"
          className="rounded-xl bg-[#8F60D0] px-6 py-3 font-semibold hover:bg-[#a27ae0] transition"
        >
          Retour à l&apos;accueil
        </a>
      </main>
    );
  } catch (e) {
    console.error(e);
    redirect("/abonnements?error=unknown");
  }
}
