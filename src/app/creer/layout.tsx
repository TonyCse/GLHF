import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Créer un tournoi | GLHF",
	description:
		"Créez un tournoi GLHF en quelques minutes : jeu, date, joueurs et description, puis partagez-le à la communauté.",
	alternates: {
		canonical: "/creer",
	},
};

export default function CreerLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<link rel="preload" as="image" href="/images/lol_bg.webp" fetchPriority="high" />
			{children}
		</>
	);
}