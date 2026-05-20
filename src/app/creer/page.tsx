"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useDialog } from "@/components/DialogProvider";

const GAME_OPTIONS = [
	{
		value: "LEAGUE_OF_LEGENDS",
		label: "League of Legends",
		description: "Stratégie, coordination et teamfights.",
		image: "/images/lol_bg.webp",
	},
	{
		value: "VALORANT",
		label: "Valorant",
		description: "Tactique, précision et agents uniques.",
		image: "/images/valorant_bg.webp",
	},
	{
		value: "OVERWATCH",
		label: "Overwatch",
		description: "Jeu d'équipe et rôles complémentaires.",
		image: "/images/ow_bg.webp",
	},
	{
		value: "FALL_GUYS",
		label: "Fall Guys",
		description: "Fun, chaos et courses d'obstacles.",
		image: "/images/fg_bg.webp",
	},
	{
		value: "MARVELS_RIVALS",
		label: "Marvel's Rivals",
		description: "Héros Marvel et combos spectaculaires.",
		image: "/images/marvel_bg.webp",
	},
	{
		value: "MINECRAFT",
		label: "Minecraft",
		description: "Construction, survie et aventures.",
		image: "/images/minecraft_bg.webp",
	},
];

// Formulaire de création de tournoi
export default function CreateTournament() {
	const { status } = useSession();
	const router = useRouter();
	const { confirm } = useDialog();

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
	const [remainingTokens, setRemainingTokens] = useState<number | null>(null);
	const tournamentActionButtonClass =
		"btn-neon flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#a855f7] to-[#8F60D0] px-4 py-2 font-semibold text-white transition";

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/connexion");
		}
	}, [status, router]);

	useEffect(() => {
		if (status !== "authenticated") return;
		let mounted = true;
		fetch("/api/user/tokens")
			.then((res) => res.json())
			.then((data) => {
				if (!mounted) return;
				const nextRemaining = Number(data?.data?.remainingTokens);
				if (Number.isFinite(nextRemaining)) {
					setRemainingTokens(nextRemaining);
				}
			})
			.catch(() => {
				if (mounted) setRemainingTokens(null);
			});
		return () => {
			mounted = false;
		};
	}, [status]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setTournament({ ...tournament, [name]: value });
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const { name, description, maxPlayers, date, time, game } = tournament;

		if (+maxPlayers < 2 || +maxPlayers > 64) {
			return setMessage({
				type: "error",
				text: "Le nombre de joueurs doit être entre 2 et 64.",
			});
		}

		const selectedDateTime = new Date(`${date}T${time}`);
		if (isNaN(selectedDateTime.getTime()) || selectedDateTime < new Date()) {
			return setMessage({ type: "error", text: "Date ou heure invalide ou passée." });
		}

		const remainingAfter =
			typeof remainingTokens === "number" ? Math.max(0, remainingTokens - 1) : null;
		const tokenLabel = (value: number) => (value > 1 ? "tokens" : "token");
		const confirmDescription =
			typeof remainingTokens === "number"
				? `Cette action consommera 1 token. Il vous restera ${remainingAfter} ${tokenLabel(remainingAfter)}.`
				: "Cette action consommera 1 token.";
		const ok = await confirm({
			title: "Créer le tournoi ?",
			description: confirmDescription,
			confirmText: "Créer",
			cancelText: "Annuler",
		});
		if (!ok) return;

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

			setMessage({ type: "success", text: "Tournoi créé avec succès." });
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
				className="bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl w-full max-w-3xl border border-[#8F60D0]/20"
			>
				<h1 className="text-4xl font-extrabold text-white text-center mb-8">Créer un tournoi</h1>

				<div className="mb-8 rounded-xl border border-[#8F60D0]/20 bg-[#18191d]/70 p-6 text-center">
					<h2 className="relative mb-4 text-3xl font-bold">
						<span className="text-[#8F60D0]">GLHF</span>
						<span className="text-white"> + Discord</span>
					</h2>
					<p className="mx-auto max-w-2xl text-base leading-relaxed text-white">
						GLHF structure le tournoi, mais la coordination des joueurs et les retours sur les
						matchs passent aujourd&apos;hui par ton Discord ou le Discord GLHF.
					</p>
				</div>

				{/* Jeu */}
				<fieldset className="mb-6">
					<legend className="block text-white mb-2 text-lg font-medium">Jeu</legend>
					<div className="grid gap-4 sm:grid-cols-2">
						{GAME_OPTIONS.map((game) => {
							const isActive = tournament.game === game.value;
							return (
								<label
									key={game.value}
									className={`group relative flex cursor-pointer flex-col gap-3 rounded-2xl border px-4 py-4 overflow-hidden bg-cover bg-center transition ${
										isActive
											? "border-[#8F60D0] ring-1 ring-[#8F60D0]/50"
											: "border-[#2a2b2e] hover:border-[#8F60D0]/60"
									}`}
									style={{ backgroundImage: `url(${game.image})` }}
								>
									<input
										id={game.value}
										type="radio"
										name="game"
										value={game.value}
										required
										checked={isActive}
										onChange={handleChange}
										className="sr-only"
									/>
									<div
										className={`absolute inset-0 transition ${
											isActive ? "bg-black/55" : "bg-black/70 group-hover:bg-black/60"
										}`}
									/>
									<div className="relative z-10 flex flex-col gap-2">
										<span className="text-lg font-semibold text-white">{game.label}</span>
										<p className="text-sm text-white">{game.description}</p>
									</div>
								</label>
							);
						})}
					</div>
					<p className="text-xs text-white mt-2">
						Choisis un jeu pour personnaliser l&apos;expérience du tournoi.
					</p>
				</fieldset>

				{/* Nom */}
				<div className="mb-6">
					<label htmlFor="name" className="block text-white mb-2 text-lg font-medium">
						Nom du tournoi
					</label>
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
					<label htmlFor="description" className="block text-white mb-2 text-lg font-medium">
						Description
					</label>
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
					<label htmlFor="maxPlayers" className="block text-white mb-2 text-lg font-medium">
						Nombre max de joueurs
					</label>
					<input
						type="number"
						id="maxPlayers"
						name="maxPlayers"
						required
						min={2}
						max={64}
						value={tournament.maxPlayers}
						onChange={handleChange}
						className="w-full px-4 py-2 rounded-md bg-[#2a2b2e] border border-[#8F60D0] text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
					/>
				</div>

				{/* Date & Heure */}
				<div className="grid grid-cols-2 gap-4 mb-6">
					<div>
						<label htmlFor="date" className="block text-white mb-2 text-lg font-medium">
							Date
						</label>
						<input
							type="date"
							id="date"
							name="date"
							required
							min={new Date().toISOString().split("T")[0]}
							value={tournament.date}
							onChange={handleChange}
							className="w-full px-4 py-2 rounded-md bg-[#2a2b2e] border border-[#8F60D0] text-white appearance-none [&::-webkit-calendar-picker-indicator]:invert"
						/>
					</div>
					<div>
						<label htmlFor="time" className="block text-white mb-2 text-lg font-medium">
							Heure
						</label>
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
						textSize="text-lg"
						className={tournamentActionButtonClass}
					>
						Voir le tournoi
					</Button>
				) : (
					<Button
						textSize="text-lg"
						className={tournamentActionButtonClass}
					>
						Créer le tournoi
					</Button>
				)}

				{/* Bouton de retour */}
				{message?.type === "success" && !createdTournamentId && (
					<div className="text-center mt-6">
						<Button onClick={() => router.push("/tournois")}>Retour à la liste</Button>
					</div>
				)}
			</form>
		</div>
	);
}
