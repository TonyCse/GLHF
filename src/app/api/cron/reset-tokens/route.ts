import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  // Vérifier que l'appel vient d'un cron job ou d'un service autorisé
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    // Reset les tokens pour tous les utilisateurs qui n'ont pas encore été resetés ce mois-ci
    const result = await prisma.user.updateMany({
      where: {
        OR: [
          { tokensMonthStart: null },
          { tokensMonthStart: { lt: firstDayOfMonth } }
        ]
      },
      data: {
        tokensUsedThisMonth: 0,
        tokensMonthStart: firstDayOfMonth,
      }
    });

    console.log(`Reset mensuel des tokens effectué: ${result.count} utilisateurs mis à jour`);

    return NextResponse.json({
      success: true,
      message: `${result.count} utilisateurs mis à jour`,
      resetDate: firstDayOfMonth.toISOString(),
    });

  } catch (error) {
    console.error("Erreur lors du reset mensuel des tokens:", error);
    return NextResponse.json(
      { error: "Erreur lors du reset mensuel" },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour reset manuellement (admin uniquement)
export async function POST(req: Request) {
  try {
    const { authorization } = req.headers as { authorization?: string };
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    // En mode développement ou pour les tests, permettre le reset manuel
    // En production, cette route devrait être sécurisée différemment
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const result = await prisma.user.updateMany({
      data: {
        tokensUsedThisMonth: 0,
        tokensMonthStart: firstDayOfMonth,
      }
    });

    return NextResponse.json({
      success: true,
      message: `Reset forcé: ${result.count} utilisateurs mis à jour`,
      resetDate: firstDayOfMonth.toISOString(),
    });

  } catch (error) {
    console.error("Erreur lors du reset forcé des tokens:", error);
    return NextResponse.json(
      { error: "Erreur lors du reset forcé" },
      { status: 500 }
    );
  }
}

