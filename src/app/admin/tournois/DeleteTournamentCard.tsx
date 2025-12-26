"use client";

interface Props {
  tournamentId: number;
}

export default function DeleteTournamentCard({ tournamentId }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce tournoi ?")) {
      e.preventDefault();
    }
  };

  return (
    <form
      method="POST"
      action={`/api/admin/tournaments/${tournamentId}/toggle-delete`}
      className="flex-1"
      onSubmit={handleSubmit}
    >
      <button
        className="w-full rounded-lg border border-red-600/40 text-red-300 hover:border-red-500 hover:text-red-200 px-3 py-2 text-sm"
        type="submit"
      >
        Supprimer
      </button>
    </form>
  );
}




