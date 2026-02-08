import Link from "next/link";
import { AlertTriangle, Home, Trophy } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#232426] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(143,96,208,0.2),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(168,85,247,0.14),_transparent_55%)]" />
      <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(120deg,_rgba(255,255,255,0.2)_1px,_transparent_1px)] [background-size:48px_48px]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-20">
        <div className="grid w-full items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8F60D0]/40 bg-[#1c1d1f]/70 px-4 py-2 text-xs uppercase tracking-[0.35em] text-[#8F60D0]">
              Navigation interrompue
            </div>
            <h1 className="mt-6 text-4xl font-bold md:text-6xl">Page introuvable</h1>
            <p className="mt-4 text-lg leading-relaxed text-gray-300">
              La page que tu cherches n&apos;existe plus ou n&apos;a jamais ete creee. Reviens a
              l&apos;accueil ou plonge directement dans les tournois.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8F60D0] to-[#A855F7] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
              >
                <Home className="h-5 w-5" />
                Retour a l&apos;accueil
              </Link>
              <Link
                href="/tournois"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#1c1d1f]/80 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#8F60D0]/60"
              >
                <Trophy className="h-5 w-5 text-[#8F60D0]" />
                Voir les tournois
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl border border-[#8F60D0]/20 bg-gradient-to-br from-[#1c1d1f] via-[#202125] to-[#2b2c30] p-10 shadow-2xl">
              <div className="absolute -top-4 left-6 inline-flex items-center gap-2 rounded-full border border-[#8F60D0]/40 bg-[#1c1d1f] px-3 py-1 text-xs uppercase tracking-[0.3em] text-[#8F60D0] shadow-lg">
                <AlertTriangle className="h-4 w-4" />
                Signal perdu
              </div>

              <div className="text-[96px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#8F60D0] via-white to-[#A855F7] md:text-[120px]">
                404
              </div>
              <p className="mt-4 text-gray-300">
                On a perdu la trace de cette page, mais la suite t&apos;attend.
              </p>

              <div className="mt-6 space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[#8F60D0]" />
                  Verifie l&apos;adresse dans la barre du navigateur.
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[#A855F7]" />
                  Utilise le menu pour revenir a une page connue.
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-white/70" />
                  Les tournois GLHF tournent en ce moment.
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-white/10 bg-[#232426]/80 p-4 text-sm text-gray-400">
                Besoin d&apos;aide ? Passe par le plan du site ou contacte-nous.
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <Link href="/plan-du-site" className="text-[#8F60D0] hover:text-white">
                    Plan du site
                  </Link>
                  <Link href="/contact" className="text-[#8F60D0] hover:text-white">
                    Contact
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
