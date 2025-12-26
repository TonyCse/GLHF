"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email ou mot de passe incorrect");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] border border-white/10 p-8 rounded-xl shadow-xl w-full max-w-md"
      >
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8F60D0] to-[#A855F7] text-center mb-8">
          Connexion
        </h1>

        <div className="mb-6">
          <label htmlFor="email" className="block text-gray-300 mb-2 text-lg font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-[#2a2b2e] border border-[#8F60D0] text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-300 mb-2 text-lg font-medium">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-[#2a2b2e] border border-[#8F60D0] text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <button
          type="submit"
          className="w-full py-3 font-bold text-white rounded-md bg-gradient-to-r from-[#8F60D0] to-[#A855F7] hover:from-[#A855F7] hover:to-[#8F60D0] transition duration-300"
        >
          Se connecter
        </button>

        <p className="text-sm text-center text-gray-300 mt-6">
          Pas encore de compte ?{" "}
          <a href="/signup" className="text-[#A855F7] underline hover:text-[#8F60D0]">
            S’inscrire
          </a>
        </p>
      </form>
    </div>
  );
}
