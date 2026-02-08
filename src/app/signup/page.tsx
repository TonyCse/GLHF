'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const PSEUDO_REGEX = /^[a-zA-Z0-9._-]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72;
const PASSWORD_RULES = {
  lower: /[a-z]/,
  upper: /[A-Z]/,
  number: /\d/,
  special: /[^A-Za-z0-9]/,
  whitespace: /\s/,
};

function validateSignup(pseudo: string, email: string, password: string) {
  if (!pseudo || !email || !password) {
    return 'Tous les champs sont requis';
  }
  if (!PSEUDO_REGEX.test(pseudo)) {
    return 'Pseudo invalide (3-20 caracteres, lettres/nombres/._-)';
  }
  if (!EMAIL_REGEX.test(email)) {
    return 'Email invalide';
  }
  if (
    password.length < PASSWORD_MIN ||
    password.length > PASSWORD_MAX ||
    PASSWORD_RULES.whitespace.test(password) ||
    !PASSWORD_RULES.lower.test(password) ||
    !PASSWORD_RULES.upper.test(password) ||
    !PASSWORD_RULES.number.test(password) ||
    !PASSWORD_RULES.special.test(password)
  ) {
    return 'Mot de passe trop faible (8-72 caracteres, maj/min/chiffre/special, sans espace)';
  }
  return null;
}

export default function Signup() {
  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedPseudo = pseudo.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password;
    const validationError = validateSignup(normalizedPseudo, normalizedEmail, normalizedPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudo: normalizedPseudo, email: normalizedEmail, password: normalizedPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/signin');
      } else {
        setError(data.message || 'Erreur lors de linscription');
      }
    } catch {
      setError('Erreur serveur. Veuillez reessayer.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] border border-white/10 p-8 rounded-xl shadow-xl"
      >
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8F60D0] to-[#A855F7] text-center mb-8">
          Créer un compte
        </h2>

        <div className="flex flex-col gap-6">
          <div>
            <label htmlFor="pseudo" className="block text-gray-300 mb-2 text-lg font-medium">
              Pseudo
            </label>
            <input
              id="pseudo"
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#2a2b2e] border border-[#8F60D0] text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
              required
              minLength={3}
              maxLength={20}
              pattern="^[a-zA-Z0-9._-]{3,20}$"
              title="3-20 caracteres, lettres/nombres/._-"
              autoComplete="username"
            />
            <p className="text-xs text-gray-500 mt-2">
              3-20 caracteres, lettres/nombres/._-
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-300 mb-2 text-lg font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#2a2b2e] border border-[#8F60D0] text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-300 mb-2 text-lg font-medium">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#2a2b2e] border border-[#8F60D0] text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
              required
              minLength={PASSWORD_MIN}
              maxLength={PASSWORD_MAX}
              autoComplete="new-password"
            />
            <p className="text-xs text-gray-500 mt-2">
              8-72 caracteres, maj/min/chiffre/special, sans espace
            </p>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 font-bold text-white rounded-md bg-gradient-to-r from-[#8F60D0] to-[#A855F7] hover:from-[#A855F7] hover:to-[#8F60D0] transition duration-300"
          >
            S’inscrire
          </button>
        </div>

        <p className="text-sm text-center text-gray-300 mt-6">
          Déjà un compte ?{' '}
          <a href="/signin" className="text-[#A855F7] underline hover:text-[#8F60D0]">
            Se connecter
          </a>
        </p>
      </form>
    </div>
  );
}
