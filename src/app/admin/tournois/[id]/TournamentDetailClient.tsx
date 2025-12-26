"use client";

import { useState } from "react";
import Link from "next/link";
import ParticipantManager from "./ParticipantManager";
import DeleteTournamentForm from "./DeleteTournamentForm";
import TournamentEditForm from "./TournamentEditForm";

interface Tournament {
  id: number;
  name: string;
  description?: string;
  game: string;
  maxPlayers: number;
  date: Date;
  isDeleted: boolean;
  createdBy?: {
    id: number;
    pseudo: string;
    email: string;
    isDeleted: boolean;
  } | null;
  participants: Array<{
    id: number;
    isActive: boolean;
    joinedAt: Date;
    user: {
      id: number;
      pseudo: string;
      email: string;
      avatarUrl: string;
      isDeleted: boolean;
      createdAt: Date;
    };
  }>;
  winner?: {
    id: number;
    pseudo: string;
    isDeleted: boolean;
  } | null;
  _count: {
    matches: number;
  };
}

interface Props {
  tournament: Tournament;
  gameLabels: Record<string, string>;
}

export default function TournamentDetailClient({ tournament: initialTournament, gameLabels }: Props) {
  const [tournament, setTournament] = useState(initialTournament);

  const handleTournamentUpdate = (updatedData: Partial<Tournament>) => {
    setTournament(prev => ({
      ...prev,
      ...updatedData,
    }));
  };

  const handleParticipantUpdate = (newParticipants: Tournament['participants']) => {
    setTournament(prev => ({
      ...prev,
      participants: newParticipants,
    }));
  };

  const statusColor = tournament.isDeleted ? "text-red-400" : "text-green-400";
  const statusLabel = tournament.isDeleted ? "Supprimé" : "Actif";
  const activeParticipants = tournament.participants.filter(p => p.isActive);

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#2a2c30]">
        <Link 
          href="/admin/tournois"
          className="text-[#8F60D0] hover:text-[#A855F7] flex items-center gap-2 transition-colors text-sm"
        >
          ← Retour aux tournois
        </Link>
        <div className="text-xs sm:text-sm text-gray-400">
          Gestion du tournoi #{tournament.id}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
        
        {/* Column 1: Tournament Info */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Tournament Header Card */}
          <div className="rounded-lg bg-[#1c1d1f] border border-[#2a2c30] overflow-hidden">
            <div className="bg-[#232426] p-4 border-b border-[#2a2c30]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-white mb-2 truncate">
                    {tournament.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="bg-[#1c1d1f] px-2 py-1 rounded text-gray-300 text-xs sm:text-sm">
                      {gameLabels[tournament.game as keyof typeof gameLabels]}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      tournament.isDeleted 
                        ? "bg-red-600/20 text-red-300" 
                        : "bg-green-600/20 text-green-300"
                    }`}>
                      ● {statusLabel}
                    </span>
                  </div>
                </div>
                
                <div className="text-left sm:text-right flex-shrink-0">
                  <div className="text-xs text-gray-400 mb-1">Date du tournoi</div>
                  <div className="text-white font-medium text-sm">
                    {new Date(tournament.date).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-4">
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                <div className="bg-[#232426] rounded p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">Participants</div>
                  <div className="text-lg font-bold text-white">
                    {activeParticipants.length}
                    <span className="text-sm text-gray-400">/{tournament.maxPlayers}</span>
                  </div>
                </div>
                
                <div className="bg-[#232426] rounded p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">Matches</div>
                  <div className="text-lg font-bold text-white">{tournament._count.matches}</div>
                </div>
                
                <div className="bg-[#232426] rounded p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">Créateur</div>
                  <div className="text-sm text-white truncate">
                    {tournament.createdBy?.isDeleted ? (
                      <span className="text-red-400">Supprimé</span>
                    ) : (
                      tournament.createdBy?.pseudo || "Inconnu"
                    )}
                  </div>
                </div>
                
                <div className="bg-[#232426] rounded p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">Gagnant</div>
                  <div className="text-sm text-white truncate">
                    {tournament.winner ? (
                      tournament.winner.isDeleted ? (
                        <span className="text-red-400">Supprimé</span>
                      ) : (
                        tournament.winner.pseudo
                      )
                    ) : (
                      <span className="text-gray-500">En cours</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {tournament.description && (
                <div className="mt-4 p-3 rounded bg-[#232426]">
                  <div className="text-xs text-gray-400 mb-1">Description</div>
                  <p className="text-gray-300 text-sm leading-relaxed">{tournament.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tournament Edit Form */}
          <div className="rounded-lg bg-[#1c1d1f] border border-[#2a2c30] p-4">
            <TournamentEditForm 
              tournament={tournament}
              onTournamentUpdate={handleTournamentUpdate}
            />
          </div>

          {/* Participants Management */}
          <div className="rounded-lg bg-[#1c1d1f] border border-[#2a2c30] overflow-hidden">
            <div className="bg-[#232426] p-4 border-b border-[#2a2c30]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Participants</h2>
                <span className="text-sm text-gray-400">
                  {activeParticipants.length}/{tournament.maxPlayers}
                </span>
              </div>
            </div>
            <div className="p-4">
              <ParticipantManager 
                tournamentId={tournament.id}
                participants={tournament.participants}
                maxPlayers={tournament.maxPlayers}
                onParticipantUpdate={handleParticipantUpdate}
              />
            </div>
          </div>
        </div>

        {/* Column 2: Actions Sidebar */}
        <div className="space-y-4">
          
          {/* Quick Actions */}
          <div className="rounded-lg bg-[#1c1d1f] border border-[#2a2c30] p-4">
            <h3 className="text-lg font-medium text-white mb-4">Actions rapides</h3>
            <div className="space-y-3">
              <Link
                href={`/tournois/${tournament.id}`}
                className="w-full block text-center rounded-lg bg-[#8F60D0] hover:bg-[#A855F7] px-4 py-2.5 text-sm font-medium text-white transition-colors"
              >
                📊 Voir public
              </Link>
              
              {!tournament.isDeleted && (
                <div className="w-full">
                  <DeleteTournamentForm tournamentId={tournament.id} />
                </div>
              )}
              
              <Link
                href="/admin/tournois"
                className="w-full block text-center rounded-lg border border-[#2a2c30] hover:border-[#8F60D0] hover:bg-[#8F60D0]/10 px-4 py-2.5 text-sm transition-colors"
              >
                📋 Retour liste
              </Link>
            </div>
          </div>

          {/* Tournament Info */}
          <div className="rounded-lg bg-[#1c1d1f] border border-[#2a2c30] p-4">
            <h3 className="text-lg font-medium text-white mb-4">Informations</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white">{gameLabels[tournament.game as keyof typeof gameLabels]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Capacité:</span>
                <span className="text-white">{tournament.maxPlayers} max</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Statut:</span>
                <span className={statusColor}>{statusLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Matches:</span>
                <span className="text-white">{tournament._count.matches}</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="rounded-lg bg-[#1c1d1f] border border-[#2a2c30] p-4">
            <h3 className="text-lg font-medium text-white mb-4">Statistiques</h3>
            <div className="space-y-3">
              <div className="bg-[#232426] rounded p-3 text-center">
                <div className="text-2xl font-bold text-[#8F60D0]">
                  {Math.round((activeParticipants.length / tournament.maxPlayers) * 100)}%
                </div>
                <div className="text-xs text-gray-400">Taux de remplissage</div>
              </div>
              
              <div className="bg-[#232426] rounded p-3 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {activeParticipants.length}
                </div>
                <div className="text-xs text-gray-400">Participants actifs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
