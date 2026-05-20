"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { useSession } from "next-auth/react";
import ContentPageShell from "@/components/ContentPageShell";

export default function DonneesPersonnelles() {
  const { data: session } = useSession();
  const isAuthed = Boolean(session?.user);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    requestType: "acces",
    details: "",
  });

  useEffect(() => {
    if (!session?.user) return;
    const pseudo = session.user.pseudo || session.user.name || "";
    const email = session.user.email || "";
    setFormState((prev) => ({
      ...prev,
      name: prev.name || pseudo,
      email: prev.email || email,
    }));
  }, [session]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAuthed) {
      setError("Connecte-toi pour envoyer une demande.");
      return;
    }
    setSent(false);
    setError(null);
    setLoading(true);

    const message = [
      "Demande RGPD",
      `Pseudo: ${formState.name}`,
      `Email: ${formState.email}`,
      `Type: ${formState.requestType}`,
      `Details: ${formState.details}`,
    ].join("\n");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          message,
        }),
      });
      if (!res.ok) {
        let msg = "Une erreur est survenue. Veuillez réessayer.";
        try {
          const data = await res.json();
          if (data?.message) msg = data.message;
        } catch {
          // ignore
        }
        setError(msg);
        return;
      }
      setSent(true);
      setFormState((prev) => ({ ...prev, details: "" }));
    } catch {
      setError("Impossible d'envoyer la demande pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContentPageShell
      title="Données personnelles"
      description="Exercez vos droits RGPD ou contactez notre DPO."
      icon={<FileText size={36} className="text-white" />}
    >
      <div className="space-y-6">
        <section className="rounded-xl border border-[#8F60D0]/10 bg-[#18191d]/70 p-6 shadow-lg">
          <p className="text-lg leading-relaxed text-white">
            Consultez la{" "}
            <Link href="/politique-confidentialite" className="text-[#8F60D0] hover:underline">
              politique de confidentialité
            </Link>{" "}
            pour comprendre comment nous traitons vos données.
          </p>
        </section>

        <section className="rounded-xl border border-[#8F60D0]/10 bg-[#18191d]/70 p-6 shadow-lg">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="dp-pseudo" className="mb-2 block text-white">Pseudo</label>
              <input
                id="dp-pseudo"
                type="text"
                required
                minLength={2}
                maxLength={20}
                value={formState.name}
                onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-md border border-gray-600 bg-[#2a2b2e] p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8F60D0]"
                placeholder="Votre pseudo"
                readOnly={Boolean(session?.user?.pseudo || session?.user?.name)}
                disabled={!isAuthed}
              />
            </div>
            <div>
              <label htmlFor="dp-email" className="mb-2 block text-white">Email</label>
              <input
                id="dp-email"
                type="email"
                required
                value={formState.email}
                onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-md border border-gray-600 bg-[#2a2b2e] p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8F60D0]"
                placeholder="Votre email"
                readOnly={Boolean(session?.user?.email)}
                disabled={!isAuthed}
              />
            </div>
            <div>
              <label htmlFor="dp-request" className="mb-2 block text-white">Type de demande</label>
              <select
                id="dp-request"
                value={formState.requestType}
                onChange={(e) => setFormState((prev) => ({ ...prev, requestType: e.target.value }))}
                className="w-full rounded-md border border-gray-600 bg-[#2a2b2e] p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8F60D0]"
              >
                <option value="acces">Accès</option>
                <option value="rectification">Rectification</option>
                <option value="suppression">Suppression</option>
                <option value="portabilite">Portabilité</option>
                <option value="opposition">Opposition</option>
              </select>
            </div>
            <div>
              <label htmlFor="dp-details" className="mb-2 block text-white">Détails</label>
              <textarea
                id="dp-details"
                required
                rows={4}
                value={formState.details}
                onChange={(e) => setFormState((prev) => ({ ...prev, details: e.target.value }))}
                className="w-full rounded-md border border-gray-600 bg-[#2a2b2e] p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8F60D0]"
                placeholder="Précisez votre demande"
                disabled={loading || !isAuthed}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !isAuthed}
              className="w-full rounded-md bg-[#8F60D0] p-3 font-semibold text-white transition hover:bg-[#754bb2]"
            >
              {loading ? "Envoi..." : "Envoyer la demande"}
            </button>
          </form>

          {!isAuthed && (
            <p className="mt-4 text-center text-amber-300">
              Connecte-toi pour envoyer une demande RGPD.
            </p>
          )}

          {error && <p className="mt-4 text-center text-red-400">{error}</p>}

          {sent && (
            <p className="mt-4 text-center text-green-400">
              Votre demande a bien été envoyée au DPO.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-[#8F60D0]/10 bg-[#18191d]/70 p-6 shadow-lg">
          <p className="text-lg text-white">
            Email DPO :{" "}
            <a href="mailto:contact@gl-hf.site" className="text-[#8F60D0] hover:underline">
              contact@gl-hf.site
            </a>
          </p>
        </section>
      </div>
    </ContentPageShell>
  );
}
