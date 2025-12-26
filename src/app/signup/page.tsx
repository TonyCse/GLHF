'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!pseudo || !email || !password) {
      setError('Tous les champs sont requis');
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudo, email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/signin');
      } else {
        setError(data.message || 'Erreur lors de l’inscription');
      }
    } catch {
      setError('Erreur serveur. Veuillez réessayer.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
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
            />
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
            />
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
