"use client";

import { useState } from "react";
import Button from "./Button";
import { PlusCircle } from "lucide-react";

export default function TournamentJoiner({
  tournoiId,
  textSize = "text-2xl",
}: {
  tournoiId: number;
  textSize?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tournament/${tournoiId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join" }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        console.error("Erreur lors de l'inscription");
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleJoin} textSize={textSize}>
      <>
        <PlusCircle size={30} />
        {loading ? "Chargement..." : "Rejoindre le tournoi"}
      </>
    </Button>
  );
}
