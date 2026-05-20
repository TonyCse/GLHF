"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function MotDePasseOublieClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/mot-de-passe-oublie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Impossible d'envoyer l'email de réinitialisation.");
        return;
      }

      setSuccess(
        data.message ||
          "Si un compte existe pour cet email, un lien de réinitialisation vient d'être envoyé.",
      );
    } catch {
      setError("Impossible d'envoyer l'email de réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-white/10 bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 shadow-xl"
      >
        <h1 className="mb-8 text-center text-4xl font-extrabold text-white">
          Mot de passe oublié
        </h1>

        <p className="mb-6 text-center text-base leading-relaxed text-white">
          Entrez votre email. Si un compte existe, vous recevrez un lien pour définir un nouveau
          mot de passe.
        </p>

        <div className="mb-6">
          <label htmlFor="email" className="mb-2 block text-lg font-medium text-white">
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

        {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}
        {success && <p className="mb-4 text-center text-sm text-green-500">{success}</p>}

        <button
          type="submit"
          className="w-full py-3 font-bold text-white rounded-md bg-linear-to-r from-[#8F60D0] to-[#A855F7] hover:from-[#A855F7] hover:to-[#8F60D0] transition duration-300"
          disabled={loading}
        >
          Envoyer le lien
        </button>

        <p className="mt-6 text-center text-sm text-white">
          <Link href="/connexion" className="text-[#A855F7] underline hover:text-[#8F60D0]">
            Retour à la connexion
          </Link>
        </p>
      </form>
    </div>
  );
}
