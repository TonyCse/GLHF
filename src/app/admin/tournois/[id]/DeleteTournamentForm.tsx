"use client";

import { useDialog } from "@/components/DialogProvider";

interface Props {
  tournamentId: number;
}

export default function DeleteTournamentForm({ tournamentId }: Props) {
  const { confirm } = useDialog();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ok = await confirm({
      title: "Supprimer le tournoi",
      description: "Cette action est définitive.",
      confirmText: "Supprimer",
      cancelText: "Annuler",
      variant: "danger",
    });
    if (!ok) return;
    e.currentTarget.submit();
  };

  return (
    <form
      method="POST"
      action={`/api/admin/tournaments/${tournamentId}/toggle-delete`}
      onSubmit={handleSubmit}
    >
      <button
        className="btn-danger w-full block text-center rounded-lg border border-red-600/40 text-red-300 hover:border-red-500 hover:text-red-200 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer"
        type="submit"
      >
        Supprimer le tournoi
      </button>
    </form>
  );
}
