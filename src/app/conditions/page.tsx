
"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import ContentPageShell from "@/components/ContentPageShell";

const sections = [
  {
    title: "Acceptation des conditions",
    content:
      "En utilisant notre site GLHF, vous acceptez pleinement et entièrement les présentes conditions d'utilisation.",
  },
  {
    title: "Utilisation des services",
    content:
      "Les utilisateurs doivent respecter les règles de conduite et ne pas utiliser le site à des fins illégales ou frauduleuses.",
  },
  {
    title: "Responsabilité",
    content:
      "GLHF ne peut être tenu responsable des dommages directs ou indirects résultant de l’utilisation de la plateforme.",
  },
  {
    title: "Modifications des conditions",
    content:
      "Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des mises à jour importantes.",
  },
  {
    title: "Gestion des comptes",
    content:
      "GLHF se réserve le droit de suspendre ou bannir définitivement tout compte en cas de comportement abusif, de triche, ou de violation des présentes conditions. En cas de bannissement, les forfaits actifs ne sont pas remboursés. Un compte inactif depuis plus de 12 mois pourra être désactivé.",
  },
  {
    title: "Achats et forfaits",
    content:
      "L'achat de forfaits sur GLHF est réservé aux personnes majeures ou disposant de l'autorisation d'un représentant légal. Les achats sont définitifs et non remboursables, sauf obligation légale contraire.",
  },
];

export default function ConditionsUtilisation() {
  return (
    <ContentPageShell
      title="Conditions d'utilisation"
      description="Bienvenue sur GLHF. Veuillez lire attentivement les conditions suivantes avant d'utiliser notre plateforme."
      icon={<BookOpen size={36} className="text-white" />}
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
            Pour toute question, veuillez passer par la <Link href="/contact" className="text-[#8F60D0] underline hover:text-[#A855F7]">page contact</Link>.
          </p>
        </section>
      </div>
    </ContentPageShell>
  );
}
