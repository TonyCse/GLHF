"use client";

import Link from "next/link";
import { Map } from "lucide-react";
import ContentPageShell from "@/components/ContentPageShell";

const sections = [
  {
    title: "Pages principales",
    links: [
      { href: "/", label: "Accueil" },
      { href: "/tournois", label: "Tournois" },
      { href: "/classement", label: "Classement" },
      { href: "/creer", label: "Créer un tournoi" },
    ],
  },
  {
    title: "Compte",
    links: [
      { href: "/connexion", label: "Connexion" },
      { href: "/inscription", label: "Inscription" },
      { href: "/profil", label: "Profil" },
      { href: "/abonnements", label: "Forfaits" },
    ],
  },
  {
    title: "Support et légal",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/mentions", label: "Mentions légales" },
      { href: "/conditions", label: "Conditions d'utilisation" },
      { href: "/politique-confidentialite", label: "Politique de confidentialité" },
      { href: "/donnees-personnelles", label: "Données personnelles" },
    ],
  },
];

export default function PlanDuSite() {
  return (
    <ContentPageShell
      title="Plan du site"
      description="Retrouvez les pages principales de GLHF en un coup d'œil."
      icon={<Map size={36} className="text-white" />}
    >
      <div className="grid gap-6">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-xl border border-[#8F60D0]/10 bg-[#18191d]/70 p-6 shadow-lg"
          >
            <h2 className="mb-4 text-2xl font-semibold text-[#8F60D0]">{section.title}</h2>
            <ul className="space-y-2 text-lg text-white">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-[#8F60D0]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </ContentPageShell>
  );
}
