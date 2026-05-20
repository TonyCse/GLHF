"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import ContentPageShell from "@/components/ContentPageShell";

export default function PolitiqueConfidentialite() {
  return (
    <ContentPageShell
      title="Politique de confidentialité"
      description="Cette page explique comment GLHF collecte, utilise et protège vos données."
      icon={<ShieldCheck size={36} className="text-white" />}
    >
      <div className="space-y-6">
        <section className="rounded-xl border border-[#8F60D0]/10 bg-[#18191d]/70 p-6 shadow-lg">
          <h2 className="mb-3 text-2xl font-semibold text-[#8F60D0]">Données collectées</h2>
          <p className="text-lg leading-relaxed text-white">
            Informations de compte (pseudo, email), données de profil, historique de tournois,
            abonnements et facturation.
          </p>
        </section>

        <section className="rounded-xl border border-[#8F60D0]/10 bg-[#18191d]/70 p-6 shadow-lg">
          <h2 className="mb-3 text-2xl font-semibold text-[#8F60D0]">Finalités</h2>
          <p className="text-lg leading-relaxed text-white">
            Création de compte, gestion des tournois, facturation, support client et amélioration
            de la plateforme.
          </p>
        </section>

        <section className="rounded-xl border border-[#8F60D0]/10 bg-[#18191d]/70 p-6 shadow-lg">
          <h2 className="mb-3 text-2xl font-semibold text-[#8F60D0]">Base légale</h2>
          <p className="text-lg leading-relaxed text-white">
            Exécution du contrat, respect des obligations légales et intérêt légitime pour la
            sécurité et l&apos;amélioration du service.
          </p>
        </section>

        <section className="rounded-xl border border-[#8F60D0]/10 bg-[#18191d]/70 p-6 shadow-lg">
          <h2 className="mb-3 text-2xl font-semibold text-[#8F60D0]">Conservation</h2>
          <p className="text-lg leading-relaxed text-white">
            Les données sont conservées le temps nécessaire aux finalités prévues, puis supprimées
            ou anonymisées.
          </p>
        </section>

        <section className="rounded-xl border border-[#8F60D0]/10 bg-[#18191d]/70 p-6 shadow-lg">
          <h2 className="mb-3 text-2xl font-semibold text-[#8F60D0]">Partage</h2>
          <p className="text-lg leading-relaxed text-white">
            Les données peuvent être partagées avec des prestataires de paiement et
            d&apos;hébergement, uniquement pour fournir le service.
          </p>
        </section>

        <section className="rounded-xl border border-[#8F60D0]/10 bg-[#18191d]/70 p-6 shadow-lg">
          <h2 className="mb-3 text-2xl font-semibold text-[#8F60D0]">Vos droits</h2>
          <p className="text-lg leading-relaxed text-white">
            Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données.
          </p>
          <Link
            href="/donnees-personnelles"
            className="mt-3 inline-block text-[#8F60D0] underline transition hover:text-[#A855F7]"
          >
            Exercer vos droits
          </Link>
        </section>

        <section className="rounded-xl border border-[#8F60D0]/10 bg-[#18191d]/70 p-6 shadow-lg">
          <h2 className="mb-3 text-2xl font-semibold text-[#8F60D0]">Contact DPO</h2>
          <p className="text-lg leading-relaxed text-white">
            Pour toute question, veuillez passer par la <Link href="/contact" className="text-[#8F60D0] underline hover:text-[#A855F7]">page contact</Link>.
          </p>
        </section>
      </div>
    </ContentPageShell>
  );
}
