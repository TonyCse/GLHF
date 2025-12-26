import { Suspense } from "react";
import TournamentList from "@/components/TournamentList";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center text-white text-2xl py-20">Chargement des tournois...</div>}>
      <TournamentList />
    </Suspense>
  );
}