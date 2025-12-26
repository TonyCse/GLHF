"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Gamepad,
  Trophy,
  Medal,
  RotateCcw,
  PlusCircle,
} from "lucide-react";
import TokensWidget from "@/components/TokensWidget";

const getBackgroundImage = (game: string) => {
  const map: Record<string, string> = {
    LEAGUE_OF_LEGENDS: "/images/lol_bg.webp",
    VALORANT: "/images/valorant_bg.png",
    OVERWATCH: "/images/ow_bg.jpg",
    FALL_GUYS: "/images/fg_bg.jpg",
    MARVELS_RIVALS: "/images/marvel_bg.jpg",
    MINECRAFT: "/images/minecraft_bg.jpg",
  };
  return map[game] || "/images/default.jpg";
};

export default function Profile() {
  const { data: session } = useSession();
  const [memberSince, setMemberSince] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [plan, setPlan] = useState<null | { id: number; name: string; priceCents: number; tokensPerMonth: number }>(null);
  const [stats, setStats] = useState({
    tournamentsPlayed: 0,
    tournamentsWon: 0,
    ranking: 0,
    tournamentsCreated: 0,
  });
  const [tournamentHistory, setTournamentHistory] = useState<
    {
      id: number;
      name: string;
      game: string;
      date: string;
      imageUrl?: string;
      didWin: boolean | null;
    }[]
  >([]);

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchUserData = async () => {
      const res = await fetch(`/api/user?email=${session.user.email}`);
      const data: any = await res.json();
      if (data.avatarUrl) {
        setAvatarUrl(data.avatarUrl.replace("/svg?", "/png?"));
      }

      if (data.createdAt) {
        const date = new Date(data.createdAt);
        setMemberSince(
          date.toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
          })
        );
      }

      const joinedTournaments = data.joinedTournaments || [];

      setStats({
        tournamentsPlayed: joinedTournaments.length,
        tournamentsWon: data.tournamentsWon ?? 0,
        ranking: data.ranking ?? 0,
        tournamentsCreated: data.createdTournaments?.length ?? 0,
      });

      if (data.plan) {
        setPlan({ id: data.plan.id, name: data.plan.name, priceCents: data.plan.priceCents, tokensPerMonth: data.plan.tokensPerMonth });
      } else {
        setPlan(null);
      }

      const userId = data.id;

      const history = joinedTournaments.map((t: { id: number; name: string; game: string; date: string; imageUrl?: string; matches?: { round: number; matchIndex: number; winnerId?: number }[] }) => {
        const finalRound = Math.max(...(t.matches || []).map(m => m.round), 0);
        const finalMatch = t.matches?.find(
          m => m.round === finalRound && m.matchIndex === 0
        );
        const didWin = finalMatch?.winnerId
          ? finalMatch.winnerId === userId
          : null;

        return {
          id: t.id,
          name: t.name,
          game: t.game,
          date: t.date,
          imageUrl: t.imageUrl,
          didWin,
        };
      });

      setTournamentHistory(history);
    };

    fetchUserData();
  }, [session]);

  return (
    <div className="bg-[#232426] text-white flex flex-col items-center justify-center px-4 py-10">
      <div className="relative z-10 w-full max-w-5xl">
        {/* Avatar et pseudo */}
        <div className="flex flex-col items-center bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl border border-[#8F60D0]/20">
          <div className="relative w-[120px] h-[120px]">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                fill
                sizes="120px"
                alt="avatar"
                className="object-cover rounded-full border-4 border-[#8F60D0] bg-gradient-to-br from-[#8F60D0] to-[#2e2640]"
              />
            ) : (
              <div className="w-full h-full bg-[#754bb2] border-4 border-[#8F60D0] rounded-full" />
            )}
            <button
              onClick={async () => {
                const res = await fetch("/api/user/avatar", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: session?.user?.email }),
                });
                const data: { success?: boolean } = await res.json();
                if (data.success) window.location.reload();
              }}
              className="absolute -bottom-2 -right-2 bg-[#8F60D0] hover:bg-[#A855F7] text-white p-2 rounded-full shadow cursor-pointer transition"
            >
              <RotateCcw size={18} />
            </button>
          </div>
          <h1 className="text-4xl font-bold text-[#8F60D0] mt-4">
            {session?.user?.pseudo}
          </h1>
          <p className="text-gray-300 text-lg">Membre depuis {memberSince}</p>
          {plan ? (
            <p className="text-gray-200 mt-2">Forfait actuel : <strong className="text-[#8F60D0]">{plan.name}</strong> — {(plan.priceCents/100).toFixed(2)}€ / mois</p>
          ) : (
            <p className="text-gray-400 mt-2">Aucun forfait actif — <a href="/abonnements" className="text-[#8F60D0] underline">Voir les abonnements</a></p>
          )}
        </div>

        {/* Tokens Widget */}
        <div className="mt-10">
          <TokensWidget />
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
                label: "Cote GLHF",
                value: stats.ranking,
              },
              {
                icon: <PlusCircle size={48} className="text-green-400" />,
                label: "Tournois créés",
                value: stats.tournamentsCreated,
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl border border-[#8F60D0]/20 hover:border-[#8F60D0]/40 flex flex-col items-center text-center"
              >
                <div className="mb-5">{s.icon}</div>
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <p className="text-gray-300 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Historique */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6">
            Historique des tournois
          </h2>
          {tournamentHistory.length === 0 ? (
            <p className="text-gray-400">Aucun tournoi joué pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tournamentHistory.map((t, i) => {
                const formattedDate = new Date(t.date).toLocaleDateString(
                  "fr-FR",
                  {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }
                );
                const fallback = getBackgroundImage(t.game);

                const resultLabel = t.didWin === true
                  ? "Victoire"
                  : t.didWin === false
                  ? "Défaite"
                  : "En cours";

                const resultColor = t.didWin === true
                  ? "text-green-400"
                  : t.didWin === false
                  ? "text-red-400"
                  : "text-yellow-400";

                return (
                  <Link
                    key={i}
                    href={`/tournois/${t.id}`}
                    className="bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl border border-[#8F60D0]/20 hover:border-[#8F60D0]/40 flex gap-4 cursor-pointer"
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
                      <span className="text-sm text-gray-400">{t.game}</span>
                      <span className="text-sm text-gray-400">{formattedDate}</span>
                      <span className={`text-sm font-bold mt-1 ${resultColor}`}>
                        {resultLabel}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
