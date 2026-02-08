"use client";

import Link from "next/link";
import { Map } from "lucide-react";

const sections = [
  {
    title: "Pages principales",
    links: [
      { href: "/", label: "Accueil" },
      { href: "/tournois", label: "Tournois" },
      { href: "/ranking", label: "Classement" },
      { href: "/create", label: "Creer un tournoi" },
    ],
  },
  {
    title: "Compte",
    links: [
      { href: "/signin", label: "Connexion" },
      { href: "/signup", label: "Inscription" },
      { href: "/profil", label: "Profil" },
      { href: "/abonnements", label: "Forfaits" },
    ],
  },
  {
    title: "Support et legal",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/mentions", label: "Mentions legales" },
      { href: "/conditions", label: "Conditions d'utilisation" },
    ],
  },
];

export default function PlanDuSite() {
  return (
    <div className="bg-[#232426] text-white flex flex-col items-center justify-center px-4 py-10">
      <div className="relative z-10 w-full max-w-5xl">
        <div className="flex flex-col items-center bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl border border-[#8F60D0]/20">
          <div className="bg-[#8F60D0] p-4 rounded-full shadow-lg">
            <Map size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#8F60D0] mt-4">Plan du site</h1>
          <p className="text-gray-300 text-center mt-2 max-w-2xl">
            Retrouvez les pages principales de GLHF en un coup d'oeil.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-1">
          {sections.map((section) => (
            <div
              key={section.title}
              className="bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-6 rounded-xl shadow-xl border border-[#8F60D0]/10"
            >
              <h2 className="text-2xl font-semibold text-[#8F60D0] mb-4">{section.title}</h2>
              <ul className="space-y-2 text-gray-300">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-[#8F60D0] transition">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
