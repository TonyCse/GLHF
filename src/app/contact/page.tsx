"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { useSession } from "next-auth/react";
import ContentPageShell from "@/components/ContentPageShell";

export default function Contact() {
  const { data: session } = useSession();
  const isAuthed = Boolean(session?.user);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    if (!session?.user) return;
    const pseudo = session.user.pseudo || session.user.name || "";
    const email = session.user.email || "";
    setForm((prev) => ({
      ...prev,
      name: prev.name || pseudo,
      email: prev.email || email,
    }));
  }, [session]);

  return (
    <ContentPageShell
      title="Contact"
      description="Une question ? Un problème ? Écris-nous, on te répondra dès que possible."
      icon={<Mail size={36} className="text-white" />}
    >
      <div className="space-y-6">
        <section className="rounded-xl border border-[#8F60D0]/10 bg-[#18191d]/70 p-6 shadow-lg">
          <h2 className="mb-6 text-2xl font-semibold text-[#8F60D0]">Nous contacter</h2>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!isAuthed) {
                setError("Connecte-toi pour envoyer un message.");
                return;
              }
              setSubmitted(false);
              setError(null);
              setLoading(true);
              try {
                const res = await fetch("/api/contact", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    message: form.message,
                  }),
                });
                if (!res.ok) {
                  let message = "Une erreur est survenue. Veuillez réessayer.";
                  try {
                    const data = await res.json();
                    if (data?.message) message = data.message;
                  } catch {
                    // ignore parse errors
                  }
                  setError(message);
                  return;
                }
                setSubmitted(true);
                setForm({ name: "", email: "", message: "" });
              } catch {
                setError("Impossible d'envoyer le message pour le moment.");
              } finally {
                setLoading(false);
              }
            }}
          >
            <div>
              <label htmlFor="contact-pseudo" className="mb-2 block text-white">Pseudo</label>
              <input
                id="contact-pseudo"
                type="text"
                required
                minLength={2}
                maxLength={20}
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-md border border-gray-600 bg-[#2a2b2e] p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8F60D0]"
                placeholder="Votre pseudo"
                readOnly={Boolean(session?.user?.pseudo || session?.user?.name)}
                disabled={!isAuthed}
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-2 block text-white">Email</label>
              <input
                id="contact-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-md border border-gray-600 bg-[#2a2b2e] p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8F60D0]"
                placeholder="Votre email"
                readOnly={Boolean(session?.user?.email)}
                disabled={!isAuthed}
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="mb-2 block text-white">Message</label>
              <textarea
                id="contact-message"
                required
                rows={4}
                minLength={5}
                maxLength={1000}
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                className="w-full rounded-md border border-gray-600 bg-[#2a2b2e] p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8F60D0]"
                placeholder="Votre message"
                disabled={loading || !isAuthed}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !isAuthed}
              className="w-full rounded-md bg-[#8F60D0] p-3 font-semibold text-white transition hover:bg-[#754bb2]"
            >
              {loading ? "Envoi..." : "Envoyer"}
            </button>
          </form>

          {!isAuthed && (
            <p className="mt-4 text-center text-amber-300">
              Connecte-toi pour utiliser le formulaire de contact.
            </p>
          )}

          {error && <p className="mt-4 text-center font-medium text-red-400">{error}</p>}

          {submitted && (
            <p className="mt-4 text-center font-medium text-green-400">
              Merci pour votre message ! Nous vous répondrons rapidement.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-[#8F60D0]/10 bg-[#18191d]/70 p-6 shadow-lg">
          <h2 className="mb-3 text-2xl font-semibold text-[#8F60D0]">Informations</h2>
          <p className="text-lg text-white">
            Email :{" "}
            <a href="mailto:contact@gl-hf.site" className="text-[#8F60D0] hover:underline">
              contact@gl-hf.site
            </a>
          </p>
        </section>
      </div>
    </ContentPageShell>
  );
}
