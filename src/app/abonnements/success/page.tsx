// src/app/abonnements/success/page.tsx
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL!;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;

async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error("Erreur PayPal (token)");
  const data = await res.json();
  return data.access_token as string;
}

type Props = {
  // ✅ en Next 15, searchParams est une Promise
  searchParams: Promise<{
    token?: string;
    planId?: string;
  }>;
};

export default async function SuccessPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/signin");
  }

  // ✅ on "résout" les query params avant de les lire
  const params = await searchParams;
  const orderId = params.token;
  const planIdNumber = Number(params.planId);

  if (!orderId || !planIdNumber) {
    redirect("/abonnements");
  }

  try {
    const accessToken = await getAccessToken();

    const captureRes = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!captureRes.ok) {
      console.error("Erreur capture PayPal", await captureRes.text());
      redirect("/abonnements?error=paiement");
    }

    await prisma.user.update({
      where: { id: Number(session.user.id) },
      data: {
        planId: planIdNumber,
        tokensUsedThisMonth: 0,
        tokensMonthStart: new Date(),
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
