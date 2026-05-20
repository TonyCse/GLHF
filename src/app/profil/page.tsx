import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Gamepad, Trophy, Medal, PlusCircle } from "lucide-react";
import TokensWidget from "@/components/TokensWidget";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { refreshUserTokensIfNeeded } from "@/lib/tokens";
import ProfileAvatar from "./ProfileAvatar";
import DeleteAccountButton from "./DeleteAccountButton";

export const metadata: Metadata = {
  title: "Mon profil | GLHF",
  description: "Consultez et gérez votre profil GLHF.",
};

export const dynamic = "force-dynamic";

const DEFAULT_TOKENS_PER_MONTH = 3;

// Background par defaut en fonction du jeu
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

type TournamentMatch = {
  round: number;
  matchIndex: number;
  winnerId?: number | null;
};

type TournamentItem = {
  id: number;
  name: string;
  game: string;
  date: Date;
  imageUrl?: string | null;
  matches?: TournamentMatch[] | null;
};

// Profil de l'user
export default async function Profile() {
  const session = await auth();

  if (!session?.user?.email) {
    return (
      <div className="text-center text-white text-2xl">
        Connecte-toi pour accéder à ton profil.
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      createdTournaments: true,
      plan: true,
      tournamentParticipations: {
        where: { isActive: true },
        include: {
          tournament: {
            include: {
              matches: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return <div className="text-center text-white text-2xl">Profil introuvable.</div>;
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
      })
    : "";

  const joinedTournaments = user.tournamentParticipations.map(
    (participation) => participation.tournament as TournamentItem,
  );

  const stats = {
    tournamentsPlayed: joinedTournaments.length,
    tournamentsWon: user.tournamentsWon ?? 0,
    ranking: user.ranking ?? 0,
    tournamentsCreated: user.createdTournaments?.length ?? 0,
  };

  const tournamentHistory = joinedTournaments.map((t) => {
    const rounds = (t.matches || []).map((m) => m.round);
    const finalRound = rounds.length > 0 ? Math.max(...rounds) : 0;
    const finalMatch = t.matches?.find((m) => m.round === finalRound && m.matchIndex === 0);
    const didWin = finalMatch?.winnerId ? finalMatch.winnerId === user.id : null;

    return {
      id: t.id,
      name: t.name,
      game: t.game,
      date: t.date,
      imageUrl: t.imageUrl ?? undefined,
      didWin,
    };
  });

  const avatarUrl = user.avatarUrl ? user.avatarUrl.replace("/svg?", "/png?") : undefined;

  const plan = user.plan
    ? {
        id: user.plan.id,
        name: user.plan.name,
        priceCents: user.plan.priceCents,
        tokensPerMonth: user.plan.tokensPerMonth,
      }
    : null;

  const userWithTokens = await refreshUserTokensIfNeeded(user.id);
  const tokensPerMonth = userWithTokens.plan?.tokensPerMonth ?? DEFAULT_TOKENS_PER_MONTH;
  const rawUsedTokens = userWithTokens.tokensUsedThisMonth;
  const bonusTokens = Math.max(0, -rawUsedTokens);
  const totalTokensThisMonth = tokensPerMonth + bonusTokens;
  const usedTokens = Math.min(Math.max(0, rawUsedTokens), totalTokensThisMonth);
  const remainingTokens = Math.max(0, totalTokensThisMonth - usedTokens);

  const initialTokensInfo = {
    remainingTokens,
    usedTokens,
    totalTokensThisMonth,
    plan: userWithTokens.plan?.name ?? "Plan Gratuit",
    monthStart: userWithTokens.tokensMonthStart
      ? userWithTokens.tokensMonthStart.toISOString()
      : null,
  };

  return (
    <div className="bg-[#232426] text-white flex flex-col items-center justify-center px-4 py-10">
      <div className="relative z-10 w-full max-w-5xl">
        {/* Avatar et pseudo */}
        <div className="flex flex-col items-center bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl border border-[#8F60D0]/20">
          <ProfileAvatar
            key={avatarUrl ?? "default-avatar"}
            initialAvatarUrl={avatarUrl}
            email={session.user.email}
          />
          <h1 className="text-4xl font-bold text-[#8F60D0] mt-4">{user.pseudo}</h1>
          <p className="text-white text-lg">{user.email}</p>
          <p className="text-white text-lg">Membre depuis {memberSince}</p>
          {plan ? (
            <p className="text-white mt-2">
              Forfait actuel : <strong className="text-[#8F60D0]">{plan.name}</strong> -{" "}
              {(plan.priceCents / 100).toFixed(2)} EUR / mois
            </p>
          ) : (
            <p className="text-white mt-2">
              Aucun forfait actif -{" "}
              <Link href="/abonnements" className="text-[#8F60D0] underline">
                Voir les abonnements
              </Link>
            </p>
          )}
        </div>

        {/* Tokens Widget */}
        <div className="mt-10">
          <TokensWidget initialTokensInfo={initialTokensInfo} />
        </div>

        {/* Stats */}
        <div className="mt-10">
          <h2 className="text-3xl font-bold mb-6">Statistiques</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: <Gamepad size={48} className="text-blue-400" />,
                label: "Tournois joués",
                value: stats.tournamentsPlayed,
              },
              {
                icon: <Trophy size={48} className="text-yellow-400" />,
                label: "Tournois gagnés",
                value: stats.tournamentsWon,
              },
              {
                icon: <Medal size={48} className="text-orange-400" />,
                label: "Côte GLHF",
                value: stats.ranking,
              },
              {
                icon: <PlusCircle size={48} className="text-green-400" />,
                label: "Tournois créés",
                value: stats.tournamentsCreated,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl border border-[#8F60D0]/20 hover:border-[#8F60D0]/40 flex flex-col items-center text-center"
              >
                <div className="mb-5">{s.icon}</div>
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <p className="text-white mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Historique */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Historique des tournois</h2>
          {tournamentHistory.length === 0 ? (
            <p className="text-white">Aucun tournoi joué pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tournamentHistory.map((t) => {
                const formattedDate = new Date(t.date).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                });
                const fallback = getBackgroundImage(t.game);

                const resultLabel =
                  t.didWin === true ? "Victoire" : t.didWin === false ? "Défaite" : "En cours";

                const resultColor =
                  t.didWin === true
                    ? "text-green-400"
                    : t.didWin === false
                      ? "text-red-400"
                      : "text-yellow-400";

                return (
                  <Link
                    key={t.id}
                    href={`/tournois/${t.id}`}
                    className="bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl border border-[#8F60D0]/20 hover:border-[#8F60D0]/40 flex gap-4 cursor-pointer"
                  >
                    {t.imageUrl ? (
                      <Image
                        src={t.imageUrl}
                        alt={t.name}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                      />
                    ) : (
                      <div
                        className="w-[80px] h-[80px] rounded-md bg-cover bg-center"
                        style={{ backgroundImage: `url(${fallback})` }}
                      />
                    )}
                    <div className="flex flex-col justify-center">
                      <h3 className="text-xl font-bold text-white">{t.name}</h3>
                      <span className="text-sm text-white">{t.game}</span>
                      <span className="text-sm text-white">{formattedDate}</span>
                      <span className={`text-sm font-bold mt-1 ${resultColor}`}>{resultLabel}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-12 rounded-xl border border-red-500/30 bg-[#1c1d1f] p-6 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-red-300">Zone sensible</h2>
              <p className="mt-1 text-sm text-white">
                La suppression désactive ton compte et masque ton profil des pages publiques.
              </p>
            </div>
            <DeleteAccountButton />
          </div>
        </div>
      </div>
    </div>
  );
}
