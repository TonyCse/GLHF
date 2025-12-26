import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Role, Game } from "@prisma/client";
import PieChart from "@/components/PieChart";
import InteractivePieChart from "@/components/InteractivePieChart";
import BarChart from "@/components/BarChart";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const [
    users, 
    admins, 
    tournaments, 
    activeTournaments, 
    finishedTournaments,
    deletedUsers,
    deletedTournaments,
    totalParticipations,
    totalMatches,
    recentUsers,
    recentTournaments,
    gameStats,
    usersByMonth,
    tournamentsByMonth
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.ADMIN } }),
    prisma.tournament.count(),
    prisma.tournament.count({ where: { isDeleted: false } }),
    prisma.tournament.count({ where: { winnerId: { not: null } } }),
    prisma.user.count({ where: { isDeleted: true } }),
    prisma.tournament.count({ where: { isDeleted: true } }),
    prisma.tournamentParticipant.count({ where: { isActive: true } }),
    prisma.match.count(),
    prisma.user.count({ 
      where: { 
        createdAt: { 
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
        } 
      } 
    }),
    prisma.tournament.count({ 
      where: { 
        date: { 
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
        } 
      } 
    }),
    prisma.tournament.groupBy({
      by: ['game'],
      _count: {
        id: true,
      },
      where: {
        isDeleted: false
      }
    }),
    Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        return prisma.user.count({
          where: {
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        }).then(count => ({
          month: date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
          count
        }));
      })
    ),
    Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        return prisma.tournament.count({
          where: {
            date: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        }).then(count => ({
          month: date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
          count
        }));
      })
    )
  ]);

  const topCreators = await prisma.user.findMany({
    take: 5,
    orderBy: {
      createdTournaments: {
        _count: 'desc'
      }
    },
    select: {
      id: true,
      pseudo: true,
      _count: {
        select: {
          createdTournaments: true
        }
      }
    }
  });

  const topWinners = await prisma.user.findMany({
    take: 5,
    orderBy: {
      tournamentsWon: 'desc'
    },
    where: {
      tournamentsWon: { gt: 0 }
    },
    select: {
      id: true,
      pseudo: true,
      tournamentsWon: true
    }
  });

  const gameColors = {
    LEAGUE_OF_LEGENDS: '#C89B3C',
    VALORANT: '#FF4655',
    OVERWATCH: '#F99E1A',
    FALL_GUYS: '#FF6EC7',
    MARVELS_RIVALS: '#ED1C24',
    MINECRAFT: '#62A82D'
  };

  const gameLabels = {
    LEAGUE_OF_LEGENDS: 'League of Legends',
    VALORANT: 'Valorant',
    OVERWATCH: 'Overwatch',
    FALL_GUYS: 'Fall Guys',
    MARVELS_RIVALS: "Marvel's Rivals",
    MINECRAFT: 'Minecraft'
  };

  const gameChartData = gameStats.map(stat => ({
    label: gameLabels[stat.game as Game] || stat.game,
    value: stat._count.id,
    color: gameColors[stat.game as Game] || '#8F60D0'
  }));

  const creatorsChartData = topCreators.map((creator, index) => ({
    label: creator.pseudo,
    value: creator._count.createdTournaments,
    color: `hsl(${250 + index * 30}, 70%, 60%)`,
    userId: creator.id
  }));

  const winnersChartData = topWinners.map((winner, index) => ({
    label: winner.pseudo,
    value: winner.tournamentsWon,
    color: `hsl(${50 + index * 40}, 80%, 60%)`,
    userId: winner.id
  }));

  const usersMonthlyData = usersByMonth.reverse().map((data, index) => ({
    label: data.month,
    value: data.count,
    color: `hsl(${250 + index * 10}, 70%, 60%)`
  }));

  const tournamentsMonthlyData = tournamentsByMonth.reverse().map((data, index) => ({
    label: data.month,
    value: data.count,
    color: `hsl(${50 + index * 10}, 80%, 60%)`
  }));

  const Card = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = "text-[#8F60D0]",
    trend 
  }: { 
    title: string; 
    value: number | string; 
    subtitle?: string;
    icon?: string;
    color?: string;
    trend?: { value: number; isPositive: boolean; };
  }) => (
    <div className="rounded-2xl p-5 bg-[#1c1d1f] shadow border border-[#2a2c30] hover:border-[#8F60D0]/30 transition-all hover:scale-105">
      <div className="flex items-center justify-between mb-2">
        <p className="text-base uppercase tracking-wider text-white">{title}</p>
        {icon && <span className="text-4xl">{icon}</span>}
      </div>
      <p className={`text-5xl font-extrabold ${color}`}>{value}</p>
      {subtitle && <p className="text-base text-white mt-1">{subtitle}</p>}
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-base ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
          <span>{trend.isPositive ? '↗' : '↘'}</span>
          <span>{Math.abs(trend.value)}% cette semaine</span>
        </div>
      )}
    </div>
  );

  const avgTournamentsPerUser = users > 0 ? (tournaments / users).toFixed(1) : '0';
  const avgParticipationsPerUser = users > 0 ? (totalParticipations / users).toFixed(1) : '0';
  const tournamentCompletionRate = tournaments > 0 ? ((finishedTournaments / tournaments) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#8F60D0] to-[#A855F7] bg-clip-text text-transparent">
            Dashboard Admin
          </h1>
          <p className="text-xl text-white mt-1">Vue d'ensemble de la plateforme GLHF</p>
        </div>
        
        <div className="flex items-center gap-4 text-2xl">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white">Système opérationnel</span>
          </div>
          <div className="text-white">
            Dernière maj: {new Date().toLocaleTimeString('fr-FR')}
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <Card title="Utilisateurs Actifs" value={users - deletedUsers} subtitle={`${deletedUsers} supprimés`} icon="👥" color="text-blue-400" trend={{ value: recentUsers, isPositive: recentUsers > 0 }}/>
        <Card title="Admins" value={admins} subtitle={`${((admins/users)*100).toFixed(1)}% du total`} icon="🛡️" color="text-purple-400"/>
        <Card title="Tournois Actifs" value={activeTournaments} subtitle={`${deletedTournaments} supprimés`} icon="🏆" color="text-yellow-400" trend={{ value: recentTournaments, isPositive: recentTournaments > 0 }}/>
        <Card title="Tournois Terminés" value={finishedTournaments} subtitle={`${tournamentCompletionRate}% terminés`} icon="✅" color="text-green-400"/>
        <Card title="Participations" value={totalParticipations} subtitle={`${avgParticipationsPerUser} par utilisateur`} icon="🎮" color="text-cyan-400"/>
        <Card title="Matches" value={totalMatches} subtitle={`${finishedTournaments > 0 ? (totalMatches/finishedTournaments).toFixed(1) : '0'} par tournoi`} icon="⚔️" color="text-orange-400"/>
      </div>

      {/* Métriques */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Taux d'engagement" value={`${users > 0 ? ((totalParticipations / users) * 100).toFixed(1) : '0'}%`} subtitle="Participations vs Utilisateurs" icon="📈" color="text-emerald-400"/>
        <Card title="Tournois/Utilisateur" value={avgTournamentsPerUser} subtitle="Moyenne de création" icon="🎯" color="text-rose-400"/>
        <Card title="Croissance semaine" value={`+${recentUsers}`} subtitle="Nouveaux utilisateurs" icon="🚀" color="text-lime-400"/>
        <Card title="Activité récente" value={`+${recentTournaments}`} subtitle="Nouveaux tournois" icon="⭐" color="text-amber-400"/>
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <PieChart data={gameChartData} title="Répartition des jeux"/>
        <InteractivePieChart data={creatorsChartData} title="Top créateurs de tournois" enableUserClick={true}/>
        <InteractivePieChart data={winnersChartData} title="Top gagnants de tournois" enableUserClick={true}/>
      </div>

      {/* Tendances */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BarChart data={usersMonthlyData} title="Inscriptions par mois (6 derniers mois)"/>
        <BarChart data={tournamentsMonthlyData} title="Tournois créés par mois (6 derniers mois)"/>
      </div>

      {/* Alertes / Résumé / Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl p-6 bg-[#1c1d1f] border border-[#2a2c30]">
          <h3 className="text-2xl font-medium text-white mb-4 flex items-center gap-2">🚨 Alertes & Notifications</h3>
          <div className="space-y-3">
            {deletedUsers > 0 && (
              <div className="p-3 rounded-lg bg-red-600/10 border border-red-600/30 text-red-300">
                <div className="font-medium text-2xl">Utilisateurs supprimés</div>
                <div className="text-base opacity-80">{deletedUsers} comptes en soft delete</div>
              </div>
            )}
            {deletedTournaments > 0 && (
              <div className="p-3 rounded-lg bg-amber-600/10 border border-amber-600/30 text-amber-300">
                <div className="font-medium text-2xl">Tournois supprimés</div>
                <div className="text-base opacity-80">{deletedTournaments} tournois en soft delete</div>
              </div>
            )}
            {recentUsers > 5 && (
              <div className="p-3 rounded-lg bg-green-600/10 border border-green-600/30 text-green-300">
                <div className="font-medium text-2xl">Forte croissance</div>
                <div className="text-base opacity-80">{recentUsers} nouveaux utilisateurs cette semaine</div>
              </div>
            )}
            {gameChartData.length === 0 && (
              <div className="p-3 rounded-lg bg-blue-600/10 border border-blue-600/30 text-blue-300">
                <div className="font-medium text-2xl">Pas de tournois</div>
                <div className="text-base opacity-80">Aucun tournoi actif détecté</div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl p-6 bg-[#1c1d1f] border border-[#2a2c30]">
          <h3 className="text-2xl font-medium text-white mb-4 flex items-center gap-2">📊 Résumé des performances</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white text-2xl">Taux d'achèvement tournois</span>
              <span className="text-white font-medium text-2xl">{tournamentCompletionRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-2xl">Ratio Admin/Users</span>
              <span className="text-white font-medium text-2xl">{((admins/users)*100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-2xl">Participation moyenne</span>
              <span className="text-white font-medium text-2xl">{avgParticipationsPerUser}/user</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-2xl">Jeu le plus populaire</span>
              <span className="text-white font-medium text-2xl">
                {gameChartData.length > 0 ? gameChartData.reduce((a, b) => a.value > b.value ? a : b).label : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 bg-[#1c1d1f] border border-[#2a2c30]">
          <h3 className="text-2xl font-medium text-white mb-4 flex items-center gap-2">⚡ Actions rapides</h3>
          <div className="space-y-3">
            <a href="/admin/users" className="block w-full text-center rounded-lg bg-[#8F60D0] hover:bg-[#A855F7] px-4 py-3 text-2xl font-medium transition-colors">
              Gérer les utilisateurs
            </a>
            <a href="/admin/tournois" className="block w-full text-center rounded-lg border border-[#2a2c30] hover:border-[#8F60D0] hover:bg-[#8F60D0]/10 px-4 py-3 text-2xl transition-colors">
              Voir les tournois
            </a>
            <a href="/admin/paiements" className="block w-full text-center rounded-lg border border-[#2a2c30] hover:border-[#8F60D0] hover:bg-[#8F60D0]/10 px-4 py-3 text-2xl transition-colors">
              Paiements
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
