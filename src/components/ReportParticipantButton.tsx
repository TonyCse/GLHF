import { useState } from "react";
import { useDialog } from "@/components/DialogProvider";

const motifs = [
  { value: "triche", label: "Triche" },
  { value: "afk", label: "AFK / Abandon" },
  { value: "insultes", label: "Insultes / Toxicité" },
  { value: "autre", label: "Autre" },
];

export default function ReportParticipantButton({ participantId, tournoiId, reporterId }: { participantId: number, tournoiId: number, reporterId: number }) {
  const { alert } = useDialog();
  const [open, setOpen] = useState(false);
  const [motif, setMotif] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    setMotif("");
    setDetails("");
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motif) return;
    setLoading(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, motif, details, tournoiId, reporterId }),
      });
      if (res.ok) {
        await alert({ title: "Signalement envoyé", description: "Merci, votre signalement a bien été transmis." });
        setOpen(false);
      } else {
        await alert({ title: "Erreur", description: "Impossible d'envoyer le signalement." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="mt-2 text-xs text-red-400 underline hover:text-red-300"
        onClick={handleOpen}
      >
        Signaler ce joueur
      </button>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
          <form
            className="relative z-10 w-full max-w-md rounded-2xl border border-[#8F60D0]/30 bg-[#1c1d1f] p-6 shadow-2xl"
            onSubmit={handleSubmit}
          >
            <div className="text-lg font-semibold text-white mb-4">Signaler un joueur</div>
            <div className="mb-4">
              <label className="block text-sm text-white mb-2">Motif *</label>
              <select
                className="w-full rounded border border-[#8F60D0] bg-[#232426] p-2 text-white"
                value={motif}
                onChange={e => setMotif(e.target.value)}
                required
              >
                <option value="">Sélectionner…</option>
                {motifs.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-white mb-2">Détails (optionnel)</label>
              <textarea
                className="w-full rounded border border-[#8F60D0] bg-[#232426] p-2 text-white min-h-[60px]"
                value={details}
                onChange={e => setDetails(e.target.value)}
                maxLength={500}
                placeholder="Ajoutez des précisions si besoin…"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="btn-neon rounded-lg border border-white/10 px-4 py-2 text-sm text-white transition hover:border-[#8F60D0]/60 hover:text-white"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-neon rounded-lg px-4 py-2 text-sm font-semibold text-white transition bg-linear-to-r from-red-600 to-red-700"
                disabled={loading || !motif}
              >
                {loading ? "Envoi…" : "Envoyer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
