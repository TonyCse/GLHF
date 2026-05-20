"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Report = {
  id: number;
  date: string;
  tournoiId?: number | null;
  participantId?: number | null;
  reporterId?: number | null;
  motif: string;
  details?: string | null;
  tournament?: { id: number; name: string } | null;
  participant?: { id: number; pseudo: string } | null;
  reporter?: { id: number; pseudo: string } | null;
};

export default function AdminSignalementsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/report")
      .then((res) => res.json())
      .then((data) => setReports(data.reports || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-[#8F60D0]">Signalements</h1>
      {loading ? (
        <div className="text-white">Chargement…</div>
      ) : reports.length === 0 ? (
        <div className="text-white">Aucun signalement pour le moment.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-[#8F60D0]/20 bg-[#18191d] rounded-xl">
            <thead>
              <tr className="bg-[#232426]">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Tournoi</th>
                <th className="p-3 text-left">Participant</th>
                <th className="p-3 text-left">Motif</th>
                <th className="p-3 text-left">Détails</th>
                <th className="p-3 text-left">Signalé par</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-t border-[#8F60D0]/10">
                  <td className="p-3 text-sm">{new Date(r.date).toLocaleString("fr-FR")}</td>
                  <td className="p-3 text-sm">
                    {r.tournament?.id ? (
                      <Link
                        href={`/admin/tournois/${r.tournament.id}`}
                        className="text-[#FFFFFF] hover:text-[#6c3bbd]"
                        title={`Voir le tournoi ${r.tournament.name}`}
                      >
                        {r.tournament.name}
                      </Link>
                    ) : (
                      r.tournoiId
                    )}
                  </td>
                  <td className="p-3 text-sm">
                    {r.participant?.id ? (
                      <Link
                        href={`/admin/users/${r.participant.id}`}
                        className="text-red-400 hover:text-red-700"
                        title={`Voir le profil de ${r.participant.pseudo}`}
                      >
                        {r.participant.pseudo}
                      </Link>
                    ) : (
                      r.participantId
                    )}
                  </td>
                  <td className="p-3 text-sm font-semibold text-red-400">{r.motif}</td>
                  <td className="p-3 text-sm">{r.details || <span className="text-white">—</span>}</td>
                  <td className="p-3 text-sm">
                    {r.reporter?.id ? (
                      <Link
                        href={`/admin/users/${r.reporter.id}`}
                        className="text-[#8F60D0] hover:text-[#6c3bbd]"
                        title={`Voir le profil de ${r.reporter.pseudo}`}
                      >
                        {r.reporter.pseudo}
                      </Link>
                    ) : (
                      r.reporterId
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
