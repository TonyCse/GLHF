import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TournamentDetailClient from "@/components/TournamentDetailClient";
import { auth } from "@/lib/auth";
import { refreshUserTokensIfNeeded } from "@/lib/tokens";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tournoi = await prisma.tournament.findUnique({
    where: { id: parseInt(id, 10) },
    select: { name: true, description: true },
  });

  if (!tournoi) {
    return {
      title: "Tournoi introuvable | GLHF",
      alternates: { canonical: "/tournois" },
    };
  }

  return {
    title: `${tournoi.name} | GLHF`,
    description: tournoi.description || "Consultez les détails et le bracket de ce tournoi GLHF.",
    alternates: {
      canonical: `/tournois/${id}`,
    },
  };
}

const GAME_LABELS: Record<string, string> = {
  LEAGUE_OF_LEGENDS: "League of Legends",
  VALORANT: "Valorant",
  OVERWATCH: "Overwatch",
  FALL_GUYS: "Fall Guys",
  MARVELS_RIVALS: "Marvel's Rivals",
  MINECRAFT: "Minecraft",
};

const getBackgroundImage = (game: string) => {
  const map: Record<string, string> = {
    LEAGUE_OF_LEGENDS: "/images/lol_bg.webp",
    VALORANT: "/images/valorant_bg.webp",
    OVERWATCH: "/images/ow_bg.webp",
    FALL_GUYS: "/images/fg_bg.webp",
    MARVELS_RIVALS: "/images/marvel_bg.webp",
    MINECRAFT: "/images/minecraft_bg.webp",
  };
  return map[game] || "/images/default.svg";
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const tournoiId = parseInt(resolvedParams.id, 10);
  if (isNaN(tournoiId)) return notFound();

  const [session, tournoi] = await Promise.all([
    auth(),
    prisma.tournament.findUnique({
      where: { id: tournoiId },
      select: {
        id: true,
        name: true,
        description: true,
        game: true,
        date: true,
        maxPlayers: true,
        winnerId: true,
        createdBy: {
          select: {
            id: true,
            pseudo: true,
            avatarUrl: true,
            isDeleted: true,
          },
        },
        participants: {
          where: { isActive: true },
          select: {
            user: {
              select: {
                id: true,
                pseudo: true,
                avatarUrl: true,
                isDeleted: true,
              },
            },
          },
        },
      },
    }),
  ]);

  if (!tournoi) return notFound();

  const sessionUserId = session?.user?.id ? Number(session.user.id) : NaN;
  const hasSessionUser = Number.isFinite(sessionUserId);
  const isCreator = hasSessionUser && tournoi.createdBy?.id === sessionUserId;

  const gameLabel = GAME_LABELS[tournoi.game] || tournoi.game;
  const backgroundImage = getBackgroundImage(tournoi.game);

  let initialTokensInfo = null;
  let sessionUser: {
    id: number;
    pseudo: string | null;
    avatarUrl?: string | null;
    isDeleted?: boolean;
  } | null = null;

  if (hasSessionUser) {
    const userWithTokens = await refreshUserTokensIfNeeded(sessionUserId);
    sessionUser = {
      id: userWithTokens.id,
      pseudo: userWithTokens.pseudo ?? session?.user?.pseudo ?? null,
      avatarUrl: userWithTokens.avatarUrl ?? null,
      isDeleted: userWithTokens.isDeleted ?? false,
    };
    const tokensPerMonth = userWithTokens.plan?.tokensPerMonth ?? 3;
    const rawUsedTokens = userWithTokens.tokensUsedThisMonth;
    const bonusTokens = Math.max(0, -rawUsedTokens);
    const totalTokensThisMonth = tokensPerMonth + bonusTokens;
    const usedTokens = Math.min(Math.max(0, rawUsedTokens), totalTokensThisMonth);
    const remainingTokens = Math.max(0, totalTokensThisMonth - usedTokens);

    initialTokensInfo = {
      remainingTokens,
      usedTokens,
      totalTokensThisMonth,
      plan: userWithTokens.plan?.name ?? "Plan Gratuit",
    };
  }

  return (
    <div className="py-10 bg-[#232426] text-white flex flex-col items-center px-6">
      <nav aria-label="Fil d'Ariane" className="w-full max-w-5xl mb-4 text-sm text-gray-400">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-[#8F60D0] transition-colors">Accueil</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/tournois" className="hover:text-[#8F60D0] transition-colors">Tournois</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-white truncate max-w-50">{tournoi.name}</li>
        </ol>
      </nav>
      <div className="w-full max-w-5xl bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl border border-[#8F60D0]/20">
        <h1 className="text-4xl font-bold mb-8 text-center">{tournoi.name}</h1>
        <TournamentDetailClient
          tournoiId={tournoi.id}
          name={tournoi.name}
          description={tournoi.description}
          gameLabel={gameLabel}
          backgroundImage={backgroundImage}
          dateIso={tournoi.date.toISOString()}
          maxPlayers={tournoi.maxPlayers}
          winnerId={tournoi.winnerId}
          createdBy={tournoi.createdBy}
          initialParticipants={tournoi.participants?.map((participant) => participant.user) || []}
          isCreator={isCreator}
          sessionUser={sessionUser}
          initialTokensInfo={initialTokensInfo}
          showTokens={!!session}
        />
      </div>
    </div>
  );
}
