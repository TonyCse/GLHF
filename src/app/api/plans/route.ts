import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: {
        priceCents: 'asc'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        priceCents: true,
        currency: true,
        tokensPerMonth: true,
      }
    });

    return NextResponse.json({
      success: true,
      plans: plans.map(plan => ({
        ...plan,
        price: plan.priceCents / 100, // Convertir en euros
        features: getFeaturesList(plan.tokensPerMonth),
      }))
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des plans:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

function getFeaturesList(tokensPerMonth: number): string[] {
  const baseFeatures = [
    `${tokensPerMonth} tokens GLHF par mois`,
    "Participation aux tournois",
    "Système de ranking",
    "Profil personnalisé",
  ];

  if (tokensPerMonth > 3) {
    baseFeatures.push("Support prioritaire");
  }

  if (tokensPerMonth >= 8) {
    baseFeatures.push("Badge premium");
    baseFeatures.push("Statistiques avancées");
  }

  if (tokensPerMonth >= 30) {
    baseFeatures.push("Création de tournois privés");
    baseFeatures.push("Accès aux tournois exclusifs");
    baseFeatures.push("Support dédié");
  }

  return baseFeatures;
}


