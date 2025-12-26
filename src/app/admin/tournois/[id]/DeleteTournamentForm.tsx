"use client";

interface Props {
  tournamentId: number;
}

export default function DeleteTournamentForm({ tournamentId }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce tournoi ?")) {
      e.preventDefault();
    }
  };

  return (
    <form method="POST" action={`/api/admin/tournaments/${tournamentId}/toggle-delete`} onSubmit={handleSubmit}>
      <button
        className="w-full sm:w-auto rounded-lg border border-red-600/40 text-red-300 hover:border-red-500 hover:text-red-200 px-4 py-2 text-sm font-medium"
        type="submit"
      >
        Supprimer le tournoi
      </button>
    </form>
  );
}
