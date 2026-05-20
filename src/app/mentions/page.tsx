
"use client";

import Link from "next/link";

import { ShieldAlert } from "lucide-react";
import ContentPageShell from "@/components/ContentPageShell";

const sections = [
  {
    title: "Éditeur du site",
    content: "GLHF, plateforme communautaire de tournois de jeux vidéo en ligne.",
  },
  {
    title: "Hébergement",
    content: "Ce site est hébergé par Hostinger.",
  },
  {
    title: "Propriété intellectuelle",
    content:
      "Tous les contenus présents sur ce site (textes, visuels, illustrations, logos) sont la propriété exclusive de GLHF, sauf indication contraire.",
  },
  {
    title: "Données personnelles",
    content:
      "Les informations collectées sont utilisées uniquement pour améliorer l'expérience utilisateur. Aucune donnée personnelle n'est cédée à des tiers sans consentement explicite.",
  },
];

export default function MentionsLegales() {
  return (
    <ContentPageShell
      title="Mentions légales"
      description="Les informations importantes concernant l'édition, la propriété et l'utilisation du site GLHF."
      icon={<ShieldAlert size={36} className="text-white" />}
    >
      <div className="space-y-6">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-xl border border-[#8F60D0]/10 bg-[#18191d]/70 p-6 shadow-lg"
          >
            <h2 className="mb-3 text-2xl font-semibold text-[#8F60D0]">{section.title}</h2>
            <p className="text-lg leading-relaxed text-white">{section.content}</p>
          </section>
        ))}

        <section className="rounded-xl border border-[#8F60D0]/10 bg-[#18191d]/70 p-6 shadow-lg">
          <h2 className="mb-3 text-2xl font-semibold text-[#8F60D0]">Contact</h2>
          <p className="text-lg leading-relaxed text-white">
            Pour toute demande, veuillez passer par la <Link href="/contact" className="text-[#8F60D0] underline hover:text-[#A855F7]">page contact</Link>.
          </p>
        </section>
      </div>
    </ContentPageShell>
  );
}
