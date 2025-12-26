import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  const url = new URL(req.url);
  const planId = url.searchParams.get('planId');
  
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  try {
    if (planId) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      const plan = await prisma.plan.findUnique({
        where: { id: parseInt(planId) },
      });

      if (user && plan) {
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            planId: plan.id,
            // Réinitialiser les tokens pour le nouveau plan
            tokensUsedThisMonth: 0,
            tokensMonthStart: new Date(),
          },
        });
      }
    }

    // Rediriger vers la page de profil avec un message de succès
    return NextResponse.redirect(new URL('/profil?payment=success', req.url));

  } catch (error) {
    console.error("Erreur lors de la confirmation du paiement:", error);
    return NextResponse.redirect(new URL('/profil?payment=error', req.url));
  }
}

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { planId, transactionId } = await req.json();

    if (!planId) {
      return NextResponse.json(
        { error: "ID du plan requis" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const plan = await prisma.plan.findUnique({
      where: { id: parseInt(planId) },
    });

    if (!user || !plan) {
      return NextResponse.json(
        { error: "Utilisateur ou plan introuvable" },
        { status: 404 }
      );
    }

    // Mettre à jour le plan de l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        planId: plan.id,
        // Réinitialiser les tokens pour le nouveau plan
        tokensUsedThisMonth: 0,
        tokensMonthStart: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Plan ${plan.name} activé avec succès`,
      plan: {
        name: plan.name,
        tokensPerMonth: plan.tokensPerMonth,
      },
    });

  } catch (error) {
    console.error("Erreur lors de la confirmation du paiement:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

