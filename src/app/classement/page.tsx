import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Medal } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
	title: "Classement | GLHF",
	description: "Découvrez le classement des meilleurs joueurs GLHF par points et victoires en tournoi.",
	alternates: {
		canonical: "/classement",
	},
};

export const dynamic = "force-dynamic";

const PLAYERS_PER_PAGE = 10;

type SearchParams = {
	p?: string;
};

type Props = {
	searchParams?: Promise<SearchParams>;
};

export default async function Classement({ searchParams }: Props) {
	const params = await searchParams;
	const pNum = Number(params?.p ?? "1");
	const page = Number.isFinite(pNum) && pNum > 0 ? pNum : 1;
	const skip = (page - 1) * PLAYERS_PER_PAGE;

	const [totalPlayers, players] = await Promise.all([
		prisma.user.count({ where: { isDeleted: false } }),
		prisma.user.findMany({
			where: { isDeleted: false },
			orderBy: { ranking: "desc" },
			select: {
				id: true,
				pseudo: true,
				avatarUrl: true,
				ranking: true,
			},
			take: PLAYERS_PER_PAGE,
			skip,
		}),
	]);

	const totalPages = Math.max(1, Math.ceil(totalPlayers / PLAYERS_PER_PAGE));

	return (
		<div className="flex flex-col items-center justify-center px-4 py-10 bg-[#232426] w-full">
			<div className="bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 w-full max-w-3xl rounded-xl shadow-xl border border-[#8F60D0]/20">
				<h1 className="text-4xl font-extrabold text-white text-center mb-8">
					Classement des joueurs
				</h1>

				{totalPlayers === 0 ? (
					<p className="text-center text-white text-lg">Aucun joueur trouvé.</p>
				) : (
					<>
						<div className="space-y-4">
							{players.map((player, index) => {
								const realRank = skip + index + 1;
								return (
									<Link
										key={player.id}
										href={`/profil/${player.pseudo}`}
										aria-label={`${player.pseudo} — rang ${realRank} — ${player.ranking} pts`}
									>
										<div className="flex justify-between items-center bg-[#2a2b2e] mb-8 p-4 rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl border border-[#8F60D0]/20 hover:border-[#8F60D0]/40">
											<div className="flex items-center gap-4">
												{realRank <= 3 && (
													<>
														<span className="sr-only">Rang {realRank}</span>
														<Medal
															size={24}
															aria-hidden="true"
															className={
																realRank === 1
																	? "text-yellow-400"
																	: realRank === 2
																		? "text-white"
																		: "text-orange-400"
															}
														/>
													</>
												)}

												{realRank > 3 && (
													<span className="text-lg font-bold text-[#8F60D0]" aria-label={`Rang ${realRank}`}>#{realRank}</span>
												)}

												<Image
													src={player.avatarUrl || "/avatars/default.svg"}
													alt=""
													aria-hidden="true"
													width={40}
													height={40}
													className="w-10 h-10 rounded-full object-cover"
												/>

												<span className="text-lg font-medium text-white" aria-hidden="true">{player.pseudo}</span>
											</div>
											<span className="text-xl font-bold text-white" aria-hidden="true">{player.ranking} pts</span>
										</div>
									</Link>
								);
							})}
						</div>

						<nav aria-label="Pagination du classement" className="flex justify-center items-center gap-4 mt-8">
							{page > 1 ? (
								<Link
									href={`/classement?p=${page - 1}`}
									className="px-4 py-2 rounded-lg bg-[#1c1d1f] text-white transition-all hover:bg-[#8F60D0] cursor-pointer"
								>
									Précédent
								</Link>
							) : (
								<span
									aria-disabled="true"
									role="link"
									className="px-4 py-2 rounded-lg bg-[#1c1d1f] text-white opacity-40 cursor-not-allowed"
								>
									Précédent
								</span>
							)}

							<span className="text-white font-medium" aria-live="polite" aria-atomic="true">
								Page {page} / {totalPages}
							</span>

							{page < totalPages ? (
								<Link
									href={`/classement?p=${page + 1}`}
									className="px-4 py-2 rounded-lg bg-[#1c1d1f] text-white transition-all hover:bg-[#8F60D0] cursor-pointer"
								>
									Suivant
								</Link>
							) : (
								<span
									aria-disabled="true"
									role="link"
									className="px-4 py-2 rounded-lg bg-[#1c1d1f] text-white opacity-40 cursor-not-allowed"
								>
									Suivant
								</span>
							)}
						</nav>
					</>
				)}
			</div>
		</div>
	);
}
