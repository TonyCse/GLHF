"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function CreateTournament() {
  const { status } = useSession();
  const router = useRouter();

  const [tournament, setTournament] = useState({
    name: "",
    description: "",
    maxPlayers: "",
    date: "",
    time: "",
    game: "",
  });

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [createdTournamentId, setCreatedTournamentId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTournament({ ...tournament, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { name, description, maxPlayers, date, time, game } = tournament;

    if (+maxPlayers < 2 || +maxPlayers > 10) {
      return setMessage({ type: "error", text: "Le nombre de joueurs doit être entre 2 et 10." });
    }

    const selectedDateTime = new Date(`${date}T${time}`);
    if (isNaN(selectedDateTime.getTime()) || selectedDateTime < new Date()) {
      return setMessage({ type: "error", text: "Date ou heure invalide ou passée." });
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("maxPlayers", maxPlayers);
    formData.append("date", date);
    formData.append("time", time);
    formData.append("game", game);

    try {
      const res = await fetch("/api/tournament/create", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la création.");
      }

      const result = await res.json(); // On récupère l'ID du tournoi
      setCreatedTournamentId(result.id); // Stocke l'ID

      setMessage({ type: "success", text: "Tournoi créé avec succès ✅" });
      setTournament({ name: "", description: "", maxPlayers: "", date: "", time: "", game: "" });
    } catch (err: unknown) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur inconnue." });
    }
  };

  if (status === "loading") {
    return <div className="text-center text-white py-10">Chargement...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl w-full max-w-3xl border border-[#8F60D0]/20"
      >
        <h1 className="text-4xl font-extrabold text-white text-center mb-8">
          Créer un tournoi
        </h1>

        {/* Jeu */}
        <div className="mb-6">
          <label htmlFor="game" className="block text-gray-300 mb-2 text-lg font-medium">Jeu</label>
          <select
            id="game"
            name="game"
            required
            value={tournament.game}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-[#2a2b2e] border border-[#8F60D0] text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
          >
            <option value="">-- Sélectionnez un jeu --</option>
            <option value="LEAGUE_OF_LEGENDS">League of Legends</option>
            <option value="VALORANT">Valorant</option>
            <option value="OVERWATCH">Overwatch</option>
            <option value="FALL_GUYS">Fall Guys</option>
            <option value="MARVELS_RIVALS">Marvel&apos;s Rivals</option>
            <option value="MINECRAFT">Minecraft</option>
          </select>
        </div>

        {/* Nom */}
        <div className="mb-6">
          <label htmlFor="name" className="block text-gray-300 mb-2 text-lg font-medium">Nom du tournoi</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            maxLength={30}
            value={tournament.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-[#2a2b2e] border border-[#8F60D0] text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-300 mb-2 text-lg font-medium">Description</label>
          <textarea
            id="description"
            name="description"
            maxLength={300}
            value={tournament.description}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-[#2a2b2e] border border-[#8F60D0] text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
            rows={3}
          />
        </div>

        {/* Max joueurs */}
        <div className="mb-6">
          <label htmlFor="maxPlayers" className="block text-gray-300 mb-2 text-lg font-medium">Nombre max de joueurs</label>
          <input
            type="number"
            id="maxPlayers"
            name="maxPlayers"
            required
            min={2}
            max={10}
            value={tournament.maxPlayers}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-[#2a2b2e] border border-[#8F60D0] text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
          />
        </div>

        {/* Date & Heure */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="date" className="block text-gray-300 mb-2 text-lg font-medium">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              required
              value={tournament.date}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-[#2a2b2e] border border-[#8F60D0] text-white appearance-none [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
          <div>
            <label htmlFor="time" className="block text-gray-300 mb-2 text-lg font-medium">Heure</label>
            <input
              type="time"
              id="time"
              name="time"
              required
              value={tournament.time}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-[#2a2b2e] border border-[#8F60D0] text-white appearance-none [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
        </div>

        {/* Message d'erreur ou succès */}
        {message && (
          <p
            role="status"
            aria-live="polite"
            className={`text-center text-sm mb-4 ${message.type === "success" ? "text-green-400" : "text-red-400"}`}
          >
            {message.text}
          </p>
        )}

        {/* Boutons */}
        {createdTournamentId ? (
          <Button
            onClick={() => router.push(`/tournois/${createdTournamentId}`)}
            className="w-full py-3 font-bold text-white rounded-md bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-500 transition duration-300 cursor-pointer"
          >
            Voir le tournoi
          </Button>
        ) : (
          <Button
            className="w-full py-3 font-bold text-white rounded-md bg-gradient-to-r from-[#8F60D0] to-[#A855F7] hover:from-[#A855F7] hover:to-[#8F60D0] transition duration-300 cursor-pointer"
          >
            Créer le tournoi
          </Button>
        )}

        {/* Retour bouton */}
        {message?.type === "success" && !createdTournamentId && (
          <div className="text-center mt-6">
            <Button onClick={() => router.push("/tournois")}>
              Retour à la liste
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
