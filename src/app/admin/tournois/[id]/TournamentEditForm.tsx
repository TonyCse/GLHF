"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/DialogProvider";

interface Tournament {
  id: number;
  name: string;
  description?: string;
  game: string;
  maxPlayers: number;
  date: string;
  isDeleted: boolean;
}

interface Props {
  tournament: Tournament;
  onTournamentUpdate?: (updatedTournament: Partial<Tournament>) => void;
}

const GAME_OPTIONS = [
  { value: "LEAGUE_OF_LEGENDS", label: "League of Legends" },
  { value: "VALORANT", label: "Valorant" },
  { value: "OVERWATCH", label: "Overwatch" },
  { value: "FALL_GUYS", label: "Fall Guys" },
  { value: "MARVELS_RIVALS", label: "Marvel's Rivals" },
  { value: "MINECRAFT", label: "Minecraft" },
];

// Affiche le formulaire d'edition de tournoi
export default function TournamentEditForm({ tournament, onTournamentUpdate }: Props) {
  const router = useRouter();
  const { alert } = useDialog();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: tournament.name,
    description: tournament.description || "",
    game: tournament.game,
    maxPlayers: tournament.maxPlayers,
    date: new Date(tournament.date).toISOString().slice(0, 16), // Format pour datetime-local
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/tournaments/${tournament.id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date).toISOString(),
        }),
      });

      if (response.ok) {
        await response.json();

        // Mise à jour dynamique si callback fourni
        if (onTournamentUpdate) {
          onTournamentUpdate({
            ...formData,
            date: new Date(formData.date).toISOString(),
          });
        }

        setIsEditing(false);
        router.refresh();
        await alert({
          title: "Tournoi mis à jour",
          description: "Le tournoi a été mis à jour avec succès.",
        });
      } else {
        const error = await response.json();
        await alert({
          title: "Mise à jour impossible",
          description: error.message || "Impossible de mettre à jour le tournoi.",
        });
      }
    } catch {
      await alert({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du tournoi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-sm text-white transition-colors cursor-pointer"
        >
          ✏️ Modifier
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Modifier le tournoi</h3>
        <button
          onClick={() => setIsEditing(false)}
          className="text-gray-400 hover:text-white text-sm cursor-pointer"
        >
          ✕ Annuler
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom du tournoi</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg bg-[#232426] border border-[#2a2c30] px-3 py-2 text-white outline-none focus:border-[#8F60D0] text-sm"
              required
              maxLength={30}
              disabled={isLoading}
            />
          </div>

          {/* Jeu */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Jeu</label>
            <select
              value={formData.game}
              onChange={(e) => setFormData({ ...formData, game: e.target.value })}
              className="w-full rounded-lg bg-[#232426] border border-[#2a2c30] px-3 py-2 text-white outline-none focus:border-[#8F60D0] text-sm"
              disabled={isLoading}
            >
              {GAME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Max joueurs */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre maximum de joueurs
            </label>
            <input
              type="number"
              value={formData.maxPlayers}
              onChange={(e) =>
                setFormData({ ...formData, maxPlayers: parseInt(e.target.value) || 0 })
              }
              className="w-full rounded-lg bg-[#232426] border border-[#2a2c30] px-3 py-2 text-white outline-none focus:border-[#8F60D0] text-sm"
              min="2"
              max="64"
              required
              disabled={isLoading}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date et heure</label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full rounded-lg bg-[#232426] border border-[#2a2c30] px-3 py-2 text-white outline-none focus:border-[#8F60D0] text-sm"
              required
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className="sm:col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg bg-[#232426] border border-[#2a2c30] px-3 py-2 text-white outline-none focus:border-[#8F60D0] text-sm"
              rows={3}
              placeholder="Description du tournoi (optionnelle)"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto rounded-lg bg-[#8F60D0] hover:bg-[#A855F7] px-4 py-2 text-sm font-medium text-white disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Mise à jour..." : "Sauvegarder"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="w-full sm:w-auto rounded-lg border border-[#2a2c30] hover:border-[#8F60D0] px-4 py-2 text-sm cursor-pointer"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
