'use client';

import { ShieldAlert } from "lucide-react";

export default function MentionsLegales() {
  return (
    <div className="bg-[#232426] text-white flex flex-col items-center justify-center px-4 py-10">
      <div className="relative z-10 w-full max-w-5xl">
        {/* En-tête */}
        <div className="flex flex-col items-center bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl border border-[#8F60D0]/20">
          <div className="bg-[#8F60D0] p-4 rounded-full shadow-lg">
            <ShieldAlert size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#8F60D0] mt-4">Mentions Légales</h1>
          <p className="text-gray-300 text-center mt-2 max-w-2xl">
            Les informations importantes concernant l’édition, la propriété et l’utilisation du site GLHF.
          </p>
        </div>

        {/* Contenu des sections */}
        <div className="mt-10 bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl border border-[#8F60D0]/10 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-[#8F60D0]">Éditeur du site</h2>
            <p className="text-gray-300 mt-2">
              GLHF, plateforme communautaire de tournois de jeux vidéo en ligne.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#8F60D0]">Hébergement</h2>
            <p className="text-gray-300 mt-2">
              Ce site est hébergé par <strong>Hostinger</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#8F60D0]">Propriété intellectuelle</h2>
            <p className="text-gray-300 mt-2">
              Tous les contenus présents sur ce site (textes, visuels, illustrations, logos) sont la propriété exclusive de GLHF, sauf indication contraire.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#8F60D0]">Données personnelles</h2>
            <p className="text-gray-300 mt-2">
              Les informations collectées sont utilisées uniquement pour améliorer l’expérience utilisateur. Aucune donnée personnelle n’est cédée à des tiers sans consentement explicite.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#8F60D0]">Contact</h2>
            <p className="text-gray-300 mt-2">
              Pour toute demande, vous pouvez nous contacter à l’adresse :{" "}
              <a
                href="mailto:contact@gl-hf.site"
                className="text-[#8F60D0] hover:underline"
              >
                contact@gl-hf.site
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
