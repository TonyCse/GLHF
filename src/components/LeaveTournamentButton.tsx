"use client";

export default function LeaveTournamentButton({
  tournoiId,
  userId,
}: {
  tournoiId: number;
  userId?: number;
}) {
  const handleLeave = async () => {
    try {
      const res = await fetch(`/api/tournament/${tournoiId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "leave",
          userId,
        }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        console.error("Erreur lors du quit");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };

  return (
    <button
      onClick={handleLeave}
      className="cursor-pointer absolute top-2 right-2 text-red-600 hover:text-red-400 font-bold text-xl z-10"
      title="Exclure du tournoi"
    >
      ✕
    </button>
  );
}
