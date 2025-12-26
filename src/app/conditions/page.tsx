'use client';

import { BookOpen } from 'lucide-react';

export default function ConditionsUtilisation() {
  return (
    <div className="bg-[#232426] text-white flex flex-col items-center justify-center px-4 py-10">
      <div className="relative z-10 w-full max-w-5xl">
        <div className="flex flex-col items-center bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl border border-[#8F60D0]/20">
          <div className="bg-[#8F60D0] p-4 rounded-full shadow-lg">
            <BookOpen size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#8F60D0] mt-4">
            Conditions d&apos;Utilisation
          </h1>
          <p className="text-gray-300 text-center mt-2 max-w-2xl">
            Bienvenue sur GLHF ! Veuillez lire attentivement les conditions suivantes avant d&apos;utiliser notre plateforme.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          {[
            {
              title: '📘 Acceptation des conditions',
              content:
                "En utilisant notre site GLHF, vous acceptez pleinement et entièrement les présentes conditions d'utilisation.",
            },
            {
              title: '🕹️ Utilisation des services',
              content:
                'Les utilisateurs doivent respecter les règles de conduite et ne pas utiliser le site à des fins illégales ou frauduleuses.',
            },
            {
              title: '⚠️ Responsabilité',
              content:
                'GLHF ne peut être tenu responsable des dommages directs ou indirects résultant de l’utilisation de la plateforme.',
            },
            {
              title: '🔧 Modifications des conditions',
              content:
                'Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des mises à jour importantes.',
            },
            {
              title: '📩 Contact',
              content: (
                <>
                  Pour toute question, veuillez nous contacter à{' '}
                  <a
                    href="mailto:contact@glhf.com"
                    className="text-[#8F60D0] hover:underline"
                  >
                    contact@glhf.com
                  </a>
                  .
                </>
              ),
            },
          ].map((section, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-6 rounded-xl shadow-xl border border-[#8F60D0]/10"
            >
              <h2 className="text-2xl font-semibold text-[#8F60D0] mb-2">{section.title}</h2>
              <p className="text-gray-300 text-lg leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
