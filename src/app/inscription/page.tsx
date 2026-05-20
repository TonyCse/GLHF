'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

const PSEUDO_REGEX = /^[a-zA-Z0-9._-]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 12;
const PASSWORD_MAX = 72; // Limite CNIL/bcrypt
const PASSWORD_MAX_BYTES = 72;
const PASSWORD_RULES = {
	lower: /[a-z]/,
	upper: /[A-Z]/,
	number: /\d/,
	special: /[^A-Za-z0-9]/,
	whitespace: /\s/,
};

function countCategories(password: string) {
	let count = 0;
	if (PASSWORD_RULES.lower.test(password)) count++;
	if (PASSWORD_RULES.upper.test(password)) count++;
	if (PASSWORD_RULES.number.test(password)) count++;
	if (PASSWORD_RULES.special.test(password)) count++;
	return count;
}

function validateInscription(pseudo: string, email: string, password: string, isOver16: boolean) {
	if (!pseudo || !email || !password) {
		return 'Tous les champs sont requis';
	}
	if (!isOver16) {
		return 'Vous devez avoir au moins 16 ans pour vous inscrire.';
	}
	if (!PSEUDO_REGEX.test(pseudo)) {
		return 'Pseudo invalide (3-20 caractères, lettres/nombres/._-)';
	}
	if (!EMAIL_REGEX.test(email)) {
		return 'Email invalide';
	}
	if (password.length < PASSWORD_MIN) {
		return 'Mot de passe trop court (min 12 caractères)';
	}
	if (PASSWORD_RULES.whitespace.test(password)) {
		return 'Le mot de passe ne doit pas contenir d’espace';
	}
	if (typeof Buffer !== 'undefined' && Buffer.byteLength(password, 'utf8') > PASSWORD_MAX_BYTES) {
		return 'Mot de passe trop long (max 72 octets)';
	}
	if (countCategories(password) < 3) {
		return 'Le mot de passe doit contenir au moins 3 catégories parmi : minuscule, majuscule, chiffre, caractère spécial';
	}
	return null;
}

export default function Inscription() {
	const [pseudo, setPseudo] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isOver16, setIsOver16] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successEmail, setSuccessEmail] = useState<string | null>(null);
	const router = useRouter();

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const normalizedPseudo = pseudo.trim();
		const normalizedEmail = email.trim().toLowerCase();
		const normalizedPassword = password;
		const validationError = validateInscription(normalizedPseudo, normalizedEmail, normalizedPassword, isOver16);
		if (validationError) {
			setError(validationError);
			return;
		}

		try {
			const res = await fetch('/api/auth/inscription', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					pseudo: normalizedPseudo,
					email: normalizedEmail,
					password: normalizedPassword,
					isOver16,
				}),
			});

			const data = await res.json();

			if (res.ok && data.success) {
				setSuccessEmail(email.trim().toLowerCase());
			} else {
				setError(data.message || "Erreur lors de l'inscription");
			}
		} catch {
			setError('Erreur serveur. Veuillez réessayer.');
		}
	};

	if (successEmail) {
		return (
			<div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-10">
				<div className="w-full max-w-md bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] border border-white/10 p-8 rounded-xl shadow-xl text-center flex flex-col items-center gap-6">
					<div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#A855F7]/20">
						<svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#A855F7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
					</div>
					<h2 className="text-2xl font-extrabold text-white">Vérifiez votre email</h2>
					<p className="text-white leading-relaxed">
						Un email de vérification a été envoyé à{' '}
						<span className="text-[#A855F7] font-semibold">{successEmail}</span>.
						<br /><br />
						Cliquez sur le lien dans cet email pour activer votre compte et pouvoir vous connecter.
					</p>
					<p className="text-xs text-white">Pensez à vérifier vos spams si vous ne le trouvez pas.</p>
					<button
						onClick={() => router.push('/connexion')}
						className="w-full py-3 font-bold text-white rounded-md bg-linear-to-r from-[#8F60D0] to-[#A855F7] hover:from-[#A855F7] hover:to-[#8F60D0] transition duration-300"
					>
						Aller à la connexion
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-10">
			<form
				onSubmit={handleSubmit}
				   className="w-full max-w-md bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] border border-white/10 p-8 rounded-xl shadow-xl"
			>
				   <h2 className="text-4xl font-extrabold text-white text-center mb-8">
					   Créer un compte
				   </h2>

				<div className="flex flex-col gap-6">
					<div>
						<label htmlFor="pseudo" className="block text-white mb-2 text-lg font-medium">
							Pseudo
						</label>
						<input
							id="pseudo"
							type="text"
							value={pseudo}
							onChange={(e) => setPseudo(e.target.value)}
							className="w-full px-4 py-2 rounded-md bg-[#2a2b2e] border border-[#8F60D0] text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
							required
							aria-required="true"
							minLength={3}
							maxLength={20}
							pattern="^[a-zA-Z0-9\._\-]{3,20}$"
							title="3-20 caractères, lettres/nombres/._-"
							autoComplete="nickname"
						/>
						<p className="text-xs text-white mt-2">
							3-20 caractères, lettres/nombres/._-
						</p>
					</div>

					<div>
						<label htmlFor="email" className="block text-white mb-2 text-lg font-medium">
							Email
						</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full px-4 py-2 rounded-md bg-[#2a2b2e] border border-[#8F60D0] text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
							required
							aria-required="true"
							autoComplete="email"
						/>
					</div>

					<div>
						<label htmlFor="password" className="block text-white mb-2 text-lg font-medium">
							Mot de passe
						</label>
						<div className="relative">
							<input
								id="password"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-4 py-2 rounded-md bg-[#2a2b2e] border border-[#8F60D0] text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] pr-12"
								required
								aria-required="true"
								aria-invalid={!!error}
								minLength={PASSWORD_MIN}
								maxLength={PASSWORD_MAX}
								autoComplete="new-password"
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
						<p className="text-xs text-white mt-2">
							12 caractères min, max 72 octets, 3 catégories sur 4 (majuscule, minuscule, chiffre, spécial), sans espace
						</p>
					</div>

					<label
						htmlFor="isOver16"
						className="flex items-start gap-3 rounded-md border border-white/10 bg-[#232426] p-3 text-sm leading-relaxed text-white"
					>
						<input
							id="isOver16"
							type="checkbox"
							checked={isOver16}
							onChange={(e) => setIsOver16(e.target.checked)}
							className="mt-1 h-4 w-4 rounded border-[#8F60D0] bg-[#2a2b2e] accent-[#A855F7]"
							required
						/>
						<span>Je confirme avoir au moins 16 ans.</span>
					</label>

					{error && <p className="text-red-500 text-sm text-center">{error}</p>}

					<button
						type="submit"
						   className="w-full py-3 font-bold text-white rounded-md bg-linear-to-r from-[#8F60D0] to-[#A855F7] hover:from-[#A855F7] hover:to-[#8F60D0] transition duration-300"
					>
						S’inscrire
					</button>
				</div>

				<p className="text-sm text-center text-white mt-6">
					Déjà un compte ?{' '}
					<a href="/connexion" className="text-[#A855F7] underline hover:text-[#8F60D0]">
						Se connecter
					</a>
				</p>
			</form>
		</div>
	);
}
