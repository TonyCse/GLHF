'use client';

import { useState } from "react";
import { Mail } from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="bg-[#232426] text-white flex flex-col items-center justify-center px-4 py-10">
      <div className="relative z-10 w-full max-w-5xl">
        {/* En-tête */}
        <div className="flex flex-col items-center bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl border border-[#8F60D0]/20">
          <div className="bg-[#8F60D0] p-4 rounded-full shadow-lg">
            <Mail size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#8F60D0] mt-4">Contact</h1>
          <p className="text-gray-300 text-center mt-2 max-w-2xl">
            Une question ? Un problème ? Écris-nous, on te répondra dès que possible.
          </p>
        </div>

        {/* Formulaire */}
        <div className="mt-10 bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl border border-[#8F60D0]/10">
          <h2 className="text-2xl font-semibold text-[#8F60D0] mb-6">Nous contacter</h2>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <div>
              <label className="block text-gray-300">Nom</label>
              <input
                type="text"
                required
                className="w-full p-3 bg-[#2a2b2e] text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-[#8F60D0] focus:outline-none"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="block text-gray-300">Email</label>
              <input
                type="email"
                required
                className="w-full p-3 bg-[#2a2b2e] text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-[#8F60D0] focus:outline-none"
                placeholder="Votre email"
              />
            </div>
            <div>
              <label className="block text-gray-300">Message</label>
              <textarea
                required
                rows={4}
                className="w-full p-3 bg-[#2a2b2e] text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-[#8F60D0] focus:outline-none"
                placeholder="Votre message"
              />
            </div>
            <button
              type="submit"
              className="w-full p-3 bg-[#8F60D0] hover:bg-[#754bb2] text-white rounded-md transition font-semibold"
            >
              Envoyer
            </button>
          </form>

          {submitted && (
            <p className="mt-4 text-green-400 font-medium text-center">
              ✅ Merci pour votre message ! Nous vous répondrons rapidement.
            </p>
          )}
        </div>

        {/* Infos de contact */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-[#8F60D0] mb-2">Informations</h2>
          <p className="text-gray-300">
            Email :{" "}
            <a
              href="mailto:contact@gl-hf.site"
              className="text-[#8F60D0] hover:underline"
            >
              contact@gl-hf.site
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}