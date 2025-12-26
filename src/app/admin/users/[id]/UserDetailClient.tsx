"use client";

import { useState } from "react";
import { Role } from "@prisma/client";
import UserEditForm from "./UserEditForm";

interface User {
  id: number;
  pseudo: string;
  email: string;
  avatarUrl: string;
  role: Role;
  isDeleted: boolean;
  tournamentsWon: number;
  matchesWon: number;
  ranking: number;
  createdAt: Date;
  _count: {
    createdTournaments: number;
    tournamentParticipations: number;
    tournamentsVictory: number;
    matchesWonList: number;
  };
}

interface Props {
  user: User;
  statusColor: string;
  statusLabel: string;
  roleColor: string;
  gameLabels: Record<string, string>;
}

export default function UserDetailClient({ 
  user: initialUser, 
  statusColor, 
  statusLabel, 
  roleColor 
}: Props) {
  const [user, setUser] = useState(initialUser);

  const handleUserUpdate = (updatedData: Partial<User>) => {
    setUser(prev => ({
      ...prev,
      ...updatedData,
      // Mettre à jour les stats affichées
      tournamentsWon: updatedData.tournamentsWon ?? prev.tournamentsWon,
      matchesWon: updatedData.matchesWon ?? prev.matchesWon,
      ranking: updatedData.ranking ?? prev.ranking,
      pseudo: updatedData.pseudo ?? prev.pseudo,
      email: updatedData.email ?? prev.email,
      avatarUrl: updatedData.avatarUrl ?? prev.avatarUrl,
      role: updatedData.role ?? prev.role,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Informations de l'utilisateur */}
      <div className="rounded-2xl bg-[#1c1d1f] border border-[#2a2c30] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
          <div className="flex-shrink-0">
            <img
              src={user.avatarUrl || "/images/default-avatar.svg"}
              alt={user.pseudo}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#2a2c30]"
            />
          </div>
          
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">{user.pseudo}</h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-800 ${statusColor}`}>
                  ● {statusLabel}
                </span>
                <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-800 ${roleColor}`}>
                  {user.role}
                </span>
              </div>
            </div>
            
            <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 text-sm">
              <div className="space-y-2">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-gray-400">ID utilisateur:</span>
                  <span className="text-gray-300 font-mono">#{user.id}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-gray-400">Email:</span>
                  <span className="text-gray-300 break-all">{user.email}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-gray-400">Points de classement:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-bold text-lg">{user.ranking}</span>
                    <span className="text-xs px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded-full">
                      {user.ranking === 0 ? "Non classé" : `${user.ranking} pts`}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-gray-400">Membre depuis:</span>
                  <span className="text-gray-300">
                    {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long", 
                      day: "numeric"
                    })}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-gray-400">Taux de victoire:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-bold">
                      {user._count.tournamentParticipations > 0 
                        ? Math.round((user.tournamentsWon / user._count.tournamentParticipations) * 100)
                        : 0}%
                    </span>
                    <span className="text-xs text-gray-500">
                      ({user.tournamentsWon}/{user._count.tournamentParticipations})
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-gray-400">Niveau d'activité:</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      user._count.tournamentParticipations >= 10 ? 'text-green-400' :
                      user._count.tournamentParticipations >= 5 ? 'text-yellow-400' :
                      user._count.tournamentParticipations >= 1 ? 'text-orange-400' : 'text-gray-400'
                    }`}>
                      {user._count.tournamentParticipations >= 10 ? '🔥 Très actif' :
                       user._count.tournamentParticipations >= 5 ? '⭐ Actif' :
                       user._count.tournamentParticipations >= 1 ? '📈 Débutant' : '😴 Inactif'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl p-3 sm:p-4 bg-[#232426] text-center">
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Tournois créés</div>
            <div className="text-xl sm:text-2xl font-bold text-white">{user._count.createdTournaments}</div>
          </div>
          
          <div className="rounded-xl p-3 sm:p-4 bg-[#232426] text-center">
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Participations</div>
            <div className="text-xl sm:text-2xl font-bold text-white">{user._count.tournamentParticipations}</div>
          </div>
          
          <div className="rounded-xl p-3 sm:p-4 bg-[#232426] text-center">
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Victoires tournois</div>
            <div className="text-xl sm:text-2xl font-bold text-yellow-400">{user.tournamentsWon}</div>
          </div>
          
          <div className="rounded-xl p-3 sm:p-4 bg-[#232426] text-center">
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Matches gagnés</div>
            <div className="text-xl sm:text-2xl font-bold text-green-400">{user.matchesWon}</div>
          </div>
        </div>
      </div>

      {/* Formulaire d'édition */}
      <div className="rounded-2xl bg-[#1c1d1f] border border-[#2a2c30] p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
          ⚙️ Modifier l&apos;utilisateur
        </h2>
        <UserEditForm user={user} onUserUpdate={handleUserUpdate} />
      </div>
    </div>
  );
}



