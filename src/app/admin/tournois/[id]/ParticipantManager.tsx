"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  pseudo: string;
  email: string;
  avatarUrl: string;
  isDeleted: boolean;
  createdAt: string;
}

interface Participant {
  id: number;
  userId?: number;
  joinedAt: string;
  isActive: boolean;
  user: User;
}

interface Props {
  tournamentId: number;
  participants: Participant[];
  maxPlayers: number;
  onParticipantUpdate?: (participants: Participant[]) => void;
}

export default function ParticipantManager({ tournamentId, participants, maxPlayers, onParticipantUpdate }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [currentParticipants, setCurrentParticipants] = useState(participants);

  const activeParticipants = currentParticipants.filter(p => p.isActive);

  // Synchroniser avec les props du parent
  useEffect(() => {
    setCurrentParticipants(participants);
  }, [participants]);

  // Charger tous les utilisateurs disponibles
  useEffect(() => {
    const loadAvailableUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const response = await fetch(`/api/admin/tournaments/${tournamentId}/available-users`);
        if (response.ok) {
          const users = await response.json();
          setAvailableUsers(users);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadAvailableUsers();
  }, [tournamentId, activeParticipants.length]); // Recharger quand les participants changent

  // Filtrer les utilisateurs selon la recherche
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableUsers;
    }

    const query = searchQuery.toLowerCase();
    return availableUsers.filter(user => 
      user.pseudo.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query)
    );
  }, [availableUsers, searchQuery]);

  // Ajouter un participant
  const addParticipant = async (userId: number) => {
    if (activeParticipants.length >= maxPlayers) {
      alert("Le tournoi a atteint sa capacité maximale !");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/tournaments/${tournamentId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "add" }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Récupérer l'utilisateur ajouté depuis availableUsers
        const addedUser = availableUsers.find(user => user.id === userId);
        
        if (addedUser) {
          // Créer le nouveau participant
          const newParticipant: Participant = {
            id: result.participantId || Date.now(), // Utiliser l'ID retourné par l'API ou un temporaire
            userId: userId,
            joinedAt: new Date().toISOString(),
            isActive: true,
            user: addedUser
          };

          // Mettre à jour la liste locale des participants
          const updatedParticipants = [...currentParticipants, newParticipant];
          setCurrentParticipants(updatedParticipants);
          
          // Notifier le composant parent
          if (onParticipantUpdate) {
            onParticipantUpdate(updatedParticipants);
          }
        }
        
        // Retirer l'utilisateur de la liste des disponibles
        setAvailableUsers(prev => prev.filter(user => user.id !== userId));
        setSearchQuery("");
        
        alert("Participant ajouté avec succès !");
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message || "Impossible d'ajouter le participant"}`);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      alert("Erreur lors de l'ajout du participant");
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer un participant
  const removeParticipant = async (userId: number, userPseudo: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir enlever ${userPseudo} de ce tournoi ?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/tournaments/${tournamentId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "remove" }),
      });

      if (response.ok) {
        // Trouver le participant à supprimer
        const removedParticipant = currentParticipants.find(p => p.user.id === userId);
        
        // Mettre à jour la liste locale des participants
        const updatedParticipants = currentParticipants.filter(p => p.user.id !== userId);
        setCurrentParticipants(updatedParticipants);
        
        // Notifier le composant parent
        if (onParticipantUpdate) {
          onParticipantUpdate(updatedParticipants);
        }
        
        // Remettre l'utilisateur dans la liste des disponibles s'il n'est pas supprimé
        if (removedParticipant && !removedParticipant.user.isDeleted) {
          setAvailableUsers(prev => [...prev, removedParticipant.user]);
        }
        
        alert("Participant retiré avec succès !");
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message || "Impossible de supprimer le participant"}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du participant");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="text-sm text-gray-400">
          Participants actuels: <span className="text-white font-medium">{activeParticipants.length}</span> / {maxPlayers}
        </div>
        <div className={`text-sm ${activeParticipants.length >= maxPlayers ? "text-red-400" : "text-gray-400"}`}>
          {activeParticipants.length >= maxPlayers ? "Complet" : `${maxPlayers - activeParticipants.length} places restantes`}
        </div>
      </div>

      {/* Liste des participants actuels */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Participants inscrits</h3>
        {activeParticipants.length > 0 ? (
          <div className="space-y-2">
            {activeParticipants.map((participant) => (
              <div
                key={`${participant.id}-${participant.user.id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-[#232426] border border-[#2a2c30] transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={participant.user.avatarUrl || "/images/default-avatar.svg"}
                    alt={participant.user.pseudo}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-white">{participant.user.pseudo}</div>
                    <div className="text-xs text-gray-400">{participant.user.email}</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3">
                  <div className="text-xs text-gray-400">
                    Inscrit le {new Date(participant.joinedAt).toLocaleDateString("fr-FR")}
                  </div>
                  <button
                    onClick={() => removeParticipant(participant.user.id, participant.user.pseudo)}
                    disabled={isLoading}
                    className="rounded-lg border border-red-600/40 text-red-300 hover:border-red-500 hover:text-red-200 px-3 py-1.5 text-xs disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? "..." : "Enlever"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 bg-[#232426] rounded-xl">
            Aucun participant inscrit pour le moment
          </div>
        )}
      </div>

      {/* Ajouter des participants */}
      {activeParticipants.length < maxPlayers && (
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Ajouter des participants</h3>
          
          <div className="space-y-4">
            {/* Recherche */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrer par pseudo ou email..."
                className="w-full rounded-xl bg-[#232426] border border-[#2a2c30] px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-[#8F60D0]"
                disabled={isLoading}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Liste des utilisateurs disponibles */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-400">
                  Utilisateurs disponibles: 
                  <span className="text-white font-medium ml-2">
                    {isLoadingUsers ? "Chargement..." : `${filteredUsers.length} utilisateur${filteredUsers.length > 1 ? 's' : ''}`}
                  </span>
                </div>
                {searchQuery && (
                  <div className="text-xs text-blue-400">
                    Filtré par "{searchQuery}"
                  </div>
                )}
              </div>

              {isLoadingUsers ? (
                <div className="text-center py-8 text-gray-400 bg-[#232426] rounded-xl">
                  Chargement des utilisateurs...
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-[#232426] border border-[#2a2c30] hover:border-[#8F60D0]/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatarUrl || "/images/default-avatar.svg"}
                          alt={user.pseudo}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium text-white">{user.pseudo}</div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => addParticipant(user.id)}
                        disabled={isLoading}
                        className="rounded-lg bg-[#8F60D0] hover:bg-[#A855F7] px-4 py-2 text-sm font-medium text-white disabled:opacity-50 transition-colors"
                      >
                        {isLoading ? "..." : "Ajouter"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 bg-[#232426] rounded-xl">
                  {searchQuery 
                    ? `Aucun utilisateur trouvé pour "${searchQuery}"`
                    : "Tous les utilisateurs participent déjà à ce tournoi"
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
