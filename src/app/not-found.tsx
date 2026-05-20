import Link from "next/link";
import { ArrowLeft, Home, Trophy } from "lucide-react";
import ContentPageShell from "@/components/ContentPageShell";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#232426] px-4 py-10">
      <div className="w-full">
        <ContentPageShell
          title="Page introuvable"
          description="La page que vous cherchez n&apos;est plus disponible ou l&apos;adresse est incorrecte."
          maxWidthClassName="max-w-3xl"
        >
          <div className="space-y-6 text-center">
            <div className="text-6xl font-black leading-none text-white md:text-8xl lg:text-9xl">
              404
            </div>

            <div className="rounded-xl border border-[#8F60D0]/10 bg-[#18191d]/70 p-6 shadow-lg">
              <p className="text-lg leading-relaxed text-white">
                Cette page n&apos;existe pas ou n&apos;est plus disponible.<br />
                <span className="text-[#8F60D0]">Vous pouvez&nbsp;:</span> consulter les tournois en cours, vérifier l&apos;URL saisie ou revenir à l&apos;accueil.
              </p>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="btn-neon inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#8F60D0] to-[#A855F7] px-5 py-3 font-semibold text-white"
                aria-label="Retour à l&apos;accueil"
              >
                <Home className="h-4 w-4" />
                Retour à l&apos;accueil
              </Link>
              <Link
                href="/tournois"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#8F60D0]/20 bg-[#18191d]/70 px-5 py-3 font-semibold text-white transition hover:border-[#8F60D0]/50 hover:text-[#8F60D0]"
              >
                <Trophy className="h-4 w-4" />
                Voir les tournois
              </Link>
            </div>

            <Link
              href="/plan-du-site"
              className="inline-flex items-center gap-2 text-sm text-white transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Consulter le plan du site
            </Link>
          </div>
        </ContentPageShell>
      </div>
    </div>
  );
}
