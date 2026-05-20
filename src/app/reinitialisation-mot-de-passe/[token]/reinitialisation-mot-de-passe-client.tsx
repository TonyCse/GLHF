"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

type ReinitialisationMotDePasseClientProps = {
  token: string;
};

export default function ReinitialisationMotDePasseClient({
  token,
}: ReinitialisationMotDePasseClientProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const validateToken = async () => {
      try {
        const res = await fetch(
          `/api/auth/reinitialisation-mot-de-passe?token=${encodeURIComponent(token)}`,
          {
            cache: "no-store",
          },
        );

        if (!cancelled) {
          setStatus(res.ok ? "ready" : "invalid");
        }
      } catch {
        if (!cancelled) {
          setStatus("invalid");
        }
      }
    };

    void validateToken();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reinitialisation-mot-de-passe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Impossible de réinitialiser le mot de passe.");
        return;
      }

      router.push("/connexion?reset=1");
    } catch {
      setError("Impossible de réinitialiser le mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 shadow-xl">
        <h1 className="mb-8 text-center text-4xl font-extrabold text-white">
          Nouveau mot de passe
        </h1>

        {status === "checking" && (
          <p className="text-center text-base text-gray-300">Vérification du lien...</p>
        )}

        {status === "invalid" && (
          <div className="space-y-5 text-center">
            <p className="text-base leading-relaxed text-gray-300">
              Ce lien de réinitialisation est invalide ou expiré.
            </p>
            <Link
              href="/mot-de-passe-oublie"
              className="btn-neon inline-flex items-center justify-center rounded-md bg-linear-to-r from-[#8F60D0] to-[#A855F7] px-5 py-3 font-bold text-white"
            >
              Demander un nouveau lien
            </Link>
          </div>
        )}

        {status === "ready" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="mb-2 block text-lg font-medium text-gray-300">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-[#8F60D0] bg-[#2a2b2e] px-4 py-2 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
                  required
                  minLength={12}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-400 transition hover:text-white"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-lg font-medium text-gray-300"
              >
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-md border border-[#8F60D0] bg-[#2a2b2e] px-4 py-2 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
                  required
                  minLength={12}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-400 transition hover:text-white"
                  aria-label={
                    showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
                  }
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Min 12 caractères, 3 types requis, sans espace
              </p>
            </div>

            {error && <p className="text-center text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-neon w-full rounded-md bg-linear-to-r from-[#8F60D0] to-[#A855F7] py-3 font-bold text-white transition duration-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
