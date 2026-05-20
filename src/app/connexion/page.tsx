"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

export default function PageConnexion() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const normalizedEmail = email.trim().toLowerCase();
		const res = await signIn("credentials", {
			email: normalizedEmail,
			password,
			redirect: false,
		});

		if (res?.error) {
			setError(
				res.error === "EMAIL_NOT_VERIFIED"
					? "Veuillez confirmer votre email avant de vous connecter."
					: "Email ou mot de passe incorrect",
			);
		} else {
			window.location.assign("/");
		}
	};

	return (
		<div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-10">
			<form
				onSubmit={handleSubmit}
				   className="bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] border border-white/10 p-8 rounded-xl shadow-xl w-full max-w-md"
			>
				<h1 className="text-4xl font-extrabold text-white text-center mb-8">
					Connexion
				</h1>

				<div className="mb-6">
					<label htmlFor="email" className="block text-white mb-2 text-lg font-medium">
						Email
					</label>
					<input
						type="email"
						id="email"
						required
						aria-required="true"
						aria-invalid={!!error}
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						autoComplete="email"
						className="w-full px-4 py-2 rounded-md bg-[#2a2b2e] border border-[#8F60D0] text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
					/>
				</div>

				<div className="mb-6">
					<label htmlFor="password" className="block text-white mb-2 text-lg font-medium">
						Mot de passe
					</label>
					<div className="relative">
						<input
							type={showPassword ? "text" : "password"}
							id="password"
							required
							aria-required="true"
							aria-invalid={!!error}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							autoComplete="current-password"
							className="w-full px-4 py-2 rounded-md bg-[#2a2b2e] border border-[#8F60D0] text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] pr-12"
						/>
						<button
							type="button"
							aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
							onClick={() => setShowPassword((v) => !v)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-[#A855F7] focus:outline-none"
						>
							{showPassword ? (
								<EyeOff size={22} />
							) : (
								<Eye size={22} />
							)}
						</button>
					</div>
					<div className="mt-2 text-right">
						<a href="/mot-de-passe-oublie" className="text-sm text-[#A855F7] underline hover:text-[#8F60D0]">Mot de passe oublié&nbsp;?</a>
					</div>
				</div>

				{error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

				<button
					type="submit"
					   className="w-full py-3 font-bold text-white rounded-md bg-linear-to-r from-[#8F60D0] to-[#A855F7] hover:from-[#A855F7] hover:to-[#8F60D0] transition duration-300"
				>
					Se connecter
				</button>

				<p className="text-sm text-center text-white mt-6">
					Pas encore de compte ?{" "}
					<a href="/inscription" className="text-[#A855F7] underline hover:text-[#8F60D0]">
						S’inscrire
					</a>
				</p>
			</form>
		</div>
	);
}
