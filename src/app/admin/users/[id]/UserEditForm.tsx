"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client";

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
}

interface Props {
  user: User;
  onUserUpdate?: (updatedUser: Partial<User>) => void;
}

export default function UserEditForm({ user, onUserUpdate }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    pseudo: user.pseudo,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
    tournamentsWon: user.tournamentsWon,
    matchesWon: user.matchesWon,
    ranking: user.ranking,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Mise à jour dynamique des stats si callback fourni
        if (onUserUpdate) {
          onUserUpdate(formData);
        }
        
        router.refresh();
        alert("Utilisateur mis à jour avec succès !");
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message || "Impossible de mettre à jour l'utilisateur"}`);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("Erreur lors de la mise à jour de l'utilisateur");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDelete = async () => {
    const action = user.isDeleted ? "restaurer" : "supprimer";
    if (!confirm(`Êtes-vous sûr de vouloir ${action} cet utilisateur ?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/toggle-delete`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message || `Impossible de ${action} l'utilisateur`}`);
      }
    } catch (error) {
      console.error(`Erreur lors de ${action}:`, error);
      alert(`Erreur lors de ${action} de l'utilisateur`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRole = async () => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`Êtes-vous sûr de vouloir changer le rôle vers ${newRole} ?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/toggle-role`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message || "Impossible de changer le rôle"}`);
      }
    } catch (error) {
      console.error("Erreur lors du changement de rôle:", error);
      alert("Erreur lors du changement de rôle");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations principales */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            👤 Informations du profil
          </h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {/* Pseudo */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pseudo <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.pseudo}
                onChange={(e) => setFormData({ ...formData, pseudo: e.target.value })}
                className="w-full rounded-xl bg-[#232426] border border-[#2a2c30] px-4 py-3 text-white outline-none focus:border-[#8F60D0] transition-colors"
                required
                disabled={isLoading}
                placeholder="Nom d'utilisateur unique"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl bg-[#232426] border border-[#2a2c30] px-4 py-3 text-white outline-none focus:border-[#8F60D0] transition-colors"
                required
                disabled={isLoading}
                placeholder="email@exemple.com"
              />
            </div>
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL de l&apos;avatar
            </label>
            <input
              type="url"
              value={formData.avatarUrl}
              onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              className="w-full rounded-xl bg-[#232426] border border-[#2a2c30] px-4 py-3 text-white outline-none focus:border-[#8F60D0] transition-colors"
              placeholder="https://exemple.com/avatar.jpg"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">Laissez vide pour utiliser l&apos;avatar par défaut</p>
          </div>
        </div>

        {/* Permissions et rôle */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            🛡️ Permissions et rôle
          </h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {/* Rôle */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rôle d&apos;utilisateur
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                className="w-full rounded-xl bg-[#232426] border border-[#2a2c30] px-4 py-3 text-white outline-none focus:border-[#8F60D0] transition-colors"
                disabled={isLoading}
              >
                <option value="USER">👤 Utilisateur</option>
                <option value="ADMIN">🛡️ Administrateur</option>
              </select>
            </div>

            {/* Ranking */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Points de classement
              </label>
              <input
                type="number"
                value={formData.ranking}
                onChange={(e) => setFormData({ ...formData, ranking: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl bg-[#232426] border border-[#2a2c30] px-4 py-3 text-white outline-none focus:border-[#8F60D0] transition-colors"
                min="0"
                disabled={isLoading}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Statistiques de jeu */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            📊 Statistiques de jeu
          </h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {/* Tournois gagnés */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tournois gagnés
              </label>
              <input
                type="number"
                value={formData.tournamentsWon}
                onChange={(e) => setFormData({ ...formData, tournamentsWon: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl bg-[#232426] border border-[#2a2c30] px-4 py-3 text-white outline-none focus:border-[#8F60D0] transition-colors"
                min="0"
                disabled={isLoading}
                placeholder="0"
              />
            </div>

            {/* Matches gagnés */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Matches gagnés
              </label>
              <input
                type="number"
                value={formData.matchesWon}
                onChange={(e) => setFormData({ ...formData, matchesWon: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl bg-[#232426] border border-[#2a2c30] px-4 py-3 text-white outline-none focus:border-[#8F60D0] transition-colors"
                min="0"
                disabled={isLoading}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[#2a2c30]">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto rounded-lg bg-[#8F60D0] hover:bg-[#A855F7] px-6 py-3 text-sm font-medium text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Mise à jour...
              </>
            ) : (
              <>
                💾 Sauvegarder les modifications
              </>
            )}
          </button>
        </div>
      </form>

      {/* Actions rapides */}
      <div className="border-t border-[#2a2c30] pt-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          ⚡ Actions rapides
        </h3>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
          <button
            onClick={handleToggleRole}
            disabled={isLoading}
            className={`w-full rounded-lg border px-4 py-3 text-sm font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2 ${
              user.role === "ADMIN"
                ? "border-blue-600/40 text-blue-300 hover:border-blue-500 hover:text-blue-200"
                : "border-purple-600/40 text-purple-300 hover:border-purple-500 hover:text-purple-200"
            }`}
          >
            {user.role === "ADMIN" ? (
              <>
                ↓ Rétrograder en utilisateur
              </>
            ) : (
              <>
                ↑ Promouvoir administrateur
              </>
            )}
          </button>

          <button
            onClick={handleToggleDelete}
            disabled={isLoading}
            className={`w-full rounded-lg border px-4 py-3 text-sm font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2 ${
              user.isDeleted
                ? "border-green-600/40 text-green-300 hover:border-green-500 hover:text-green-200"
                : "border-red-600/40 text-red-300 hover:border-red-500 hover:text-red-200"
            }`}
          >
            {user.isDeleted ? (
              <>
                🔄 Restaurer l&apos;utilisateur
              </>
            ) : (
              <>
                🗑️ Supprimer l&apos;utilisateur
              </>
            )}
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-amber-600/10 border border-amber-600/30 rounded-lg text-amber-300 text-sm">
          ⚠️ <strong>Attention :</strong> Les actions rapides prennent effet immédiatement et ne nécessitent pas de sauvegarder le formulaire.
        </div>
      </div>
    </div>
  );
}
