import Image from "next/image";
import Link from "next/link";

type HomeHeroProps = {
  primaryCtaHref: string;
  linkButtonClass: string;
};

export default function HomeHero({ primaryCtaHref, linkButtonClass }: HomeHeroProps) {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Effets de fond */}
      <div className="absolute inset-0 bg-linear-to-br from-[#232426] via-[#1a1b1d] to-[#2d2e32]"></div>

      {/* Éléments d'arrière-plan animés */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Particules pixel, thème gaming */}
        <div className="absolute top-16 left-8 w-2 h-2 bg-[#8F60D0] opacity-80 animate-bounce"></div>
        <div className="absolute top-24 left-16 w-2 h-2 bg-[#8F60D0] opacity-60 animate-bounce delay-200"></div>
        <div className="absolute top-32 left-12 w-2 h-2 bg-[#A855F7] opacity-70 animate-bounce delay-400"></div>
        <div className="absolute top-20 right-12 w-3 h-3 bg-[#8F60D0] opacity-90 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-2 h-2 bg-[#A855F7] opacity-50 animate-bounce delay-300"></div>
        <div className="absolute top-56 right-8 w-4 h-4 bg-[#8F60D0] opacity-40 animate-bounce delay-600"></div>
        <div className="absolute bottom-32 left-20 w-3 h-3 bg-[#A855F7] opacity-60 animate-bounce delay-800"></div>
        <div className="absolute bottom-48 left-32 w-2 h-2 bg-[#8F60D0] opacity-80 animate-bounce delay-1000"></div>
        <div className="absolute bottom-40 left-8 w-2 h-2 bg-[#A855F7] opacity-50 animate-bounce delay-1200"></div>
        <div className="absolute bottom-20 right-16 w-4 h-4 bg-[#8F60D0] opacity-70 animate-bounce delay-1400"></div>
        <div className="absolute bottom-36 right-28 w-2 h-2 bg-[#A855F7] opacity-60 animate-bounce delay-1600"></div>
        <div className="absolute bottom-52 right-12 w-3 h-3 bg-[#8F60D0] opacity-40 animate-bounce delay-1800"></div>

        {/* Formes géométriques style pixel */}
        <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-16 h-16 animate-bounce delay-500">
            <div className="absolute inset-0 grid grid-cols-4 gap-1">
              <div className="bg-[#8F60D0] opacity-30"></div>
              <div className="bg-[#A855F7] opacity-40"></div>
              <div className="bg-[#8F60D0] opacity-20"></div>
              <div className="bg-transparent"></div>
              <div className="bg-[#A855F7] opacity-35"></div>
              <div className="bg-[#8F60D0] opacity-50"></div>
              <div className="bg-[#A855F7] opacity-25"></div>
              <div className="bg-[#8F60D0] opacity-30"></div>
              <div className="bg-transparent"></div>
              <div className="bg-[#A855F7] opacity-40"></div>
              <div className="bg-[#8F60D0] opacity-35"></div>
              <div className="bg-[#A855F7] opacity-20"></div>
              <div className="bg-[#8F60D0] opacity-25"></div>
              <div className="bg-transparent"></div>
              <div className="bg-[#A855F7] opacity-30"></div>
              <div className="bg-[#8F60D0] opacity-40"></div>
            </div>
          </div>
        </div>

        <div className="absolute top-3/4 right-1/4 transform translate-x-1/2 translate-y-1/2">
          <div className="relative w-12 h-12 animate-bounce delay-1000">
            <div className="absolute inset-0 grid grid-cols-3 gap-1">
              <div className="bg-[#A855F7] opacity-40"></div>
              <div className="bg-[#8F60D0] opacity-30"></div>
              <div className="bg-[#A855F7] opacity-50"></div>
              <div className="bg-[#8F60D0] opacity-35"></div>
              <div className="bg-[#A855F7] opacity-60"></div>
              <div className="bg-[#8F60D0] opacity-25"></div>
              <div className="bg-[#A855F7] opacity-30"></div>
              <div className="bg-[#8F60D0] opacity-45"></div>
              <div className="bg-[#A855F7] opacity-35"></div>
            </div>
          </div>
        </div>

        {/* Icônes gaming style pixel */}
        <div className="absolute top-1/2 left-12 transform -translate-y-1/2 animate-bounce delay-2000">
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 grid grid-cols-8 gap-px">
              <div className="bg-transparent"></div>
              <div className="bg-transparent"></div>
              <div className="bg-[#8F60D0] opacity-60"></div>
              <div className="bg-[#8F60D0] opacity-60"></div>
              <div className="bg-[#8F60D0] opacity-60"></div>
              <div className="bg-[#8F60D0] opacity-60"></div>
              <div className="bg-transparent"></div>
              <div className="bg-transparent"></div>
              <div className="bg-transparent"></div>
              <div className="bg-[#8F60D0] opacity-40"></div>
              <div className="bg-[#A855F7] opacity-80"></div>
              <div className="bg-[#A855F7] opacity-80"></div>
              <div className="bg-[#A855F7] opacity-80"></div>
              <div className="bg-[#A855F7] opacity-80"></div>
              <div className="bg-[#8F60D0] opacity-40"></div>
              <div className="bg-transparent"></div>
              <div className="bg-[#8F60D0] opacity-50"></div>
              <div className="bg-[#A855F7] opacity-90"></div>
              <div className="bg-[#A855F7] opacity-90"></div>
              <div className="bg-[#A855F7] opacity-90"></div>
              <div className="bg-[#A855F7] opacity-90"></div>
              <div className="bg-[#A855F7] opacity-90"></div>
              <div className="bg-[#A855F7] opacity-90"></div>
              <div className="bg-[#8F60D0] opacity-50"></div>
              <div className="bg-[#8F60D0] opacity-40"></div>
              <div className="bg-[#A855F7] opacity-70"></div>
              <div className="bg-[#A855F7] opacity-70"></div>
              <div className="bg-[#A855F7] opacity-70"></div>
              <div className="bg-[#A855F7] opacity-70"></div>
              <div className="bg-[#A855F7] opacity-70"></div>
              <div className="bg-[#A855F7] opacity-70"></div>
              <div className="bg-[#8F60D0] opacity-40"></div>
              <div className="bg-transparent"></div>
              <div className="bg-[#8F60D0] opacity-30"></div>
              <div className="bg-[#8F60D0] opacity-30"></div>
              <div className="bg-[#8F60D0] opacity-30"></div>
              <div className="bg-[#8F60D0] opacity-30"></div>
              <div className="bg-[#8F60D0] opacity-30"></div>
              <div className="bg-[#8F60D0] opacity-30"></div>
              <div className="bg-transparent"></div>
              <div className="bg-transparent"></div>
              <div className="bg-transparent"></div>
              <div className="bg-[#8F60D0] opacity-50"></div>
              <div className="bg-[#8F60D0] opacity-50"></div>
              <div className="bg-[#8F60D0] opacity-50"></div>
              <div className="bg-[#8F60D0] opacity-50"></div>
              <div className="bg-transparent"></div>
              <div className="bg-transparent"></div>
              <div className="bg-transparent"></div>
              <div className="bg-transparent"></div>
              <div className="bg-transparent"></div>
              <div className="bg-transparent"></div>
              <div className="bg-transparent"></div>
              <div className="bg-transparent"></div>
              <div className="bg-transparent"></div>
            </div>
          </div>
        </div>

        <div className="absolute top-1/3 right-16 transform translate-y-1/2 animate-bounce delay-2500">
          <div className="w-6 h-6 relative">
            <div className="absolute inset-0 grid grid-cols-6 gap-px">
              <div className="bg-transparent"></div>
              <div className="bg-[#A855F7] opacity-70"></div>
              <div className="bg-[#A855F7] opacity-70"></div>
              <div className="bg-[#A855F7] opacity-70"></div>
              <div className="bg-[#A855F7] opacity-70"></div>
              <div className="bg-transparent"></div>
              <div className="bg-[#A855F7] opacity-60"></div>
              <div className="bg-[#8F60D0] opacity-90"></div>
              <div className="bg-[#8F60D0] opacity-90"></div>
              <div className="bg-[#8F60D0] opacity-90"></div>
              <div className="bg-[#8F60D0] opacity-90"></div>
              <div className="bg-[#A855F7] opacity-60"></div>
              <div className="bg-[#A855F7] opacity-50"></div>
              <div className="bg-[#8F60D0] opacity-80"></div>
              <div className="bg-[#8F60D0] opacity-80"></div>
              <div className="bg-[#8F60D0] opacity-80"></div>
              <div className="bg-[#8F60D0] opacity-80"></div>
              <div className="bg-[#A855F7] opacity-50"></div>
              <div className="bg-[#A855F7] opacity-40"></div>
              <div className="bg-[#8F60D0] opacity-70"></div>
              <div className="bg-[#8F60D0] opacity-70"></div>
              <div className="bg-[#8F60D0] opacity-70"></div>
              <div className="bg-[#8F60D0] opacity-70"></div>
              <div className="bg-[#A855F7] opacity-40"></div>
              <div className="bg-transparent"></div>
              <div className="bg-[#A855F7] opacity-60"></div>
              <div className="bg-[#A855F7] opacity-60"></div>
              <div className="bg-[#A855F7] opacity-60"></div>
              <div className="bg-[#A855F7] opacity-60"></div>
              <div className="bg-transparent"></div>
              <div className="bg-transparent"></div>
              <div className="bg-transparent"></div>
              <div className="bg-[#8F60D0] opacity-50"></div>
              <div className="bg-[#8F60D0] opacity-50"></div>
              <div className="bg-transparent"></div>
              <div className="bg-transparent"></div>
            </div>
          </div>
        </div>

        {/* Orbes en dégradé */}
        <div className="absolute top-32 left-2/4 w-32 h-32 bg-linear-to-r from-[#8F60D0]/100 to-[#A855F7]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-2/4 right-1/6 w-40 h-40 bg-linear-to-r from-[#A855F7]/100 to-[#8F60D0]/15 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/4 w-24 h-24 bg-linear-to-r from-[#8F60D0]/100 to-[#A855F7]/10 rounded-full blur-2xl"></div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 text-center max-w-7xl mx-auto px-6 py-20">
        {/* Titre avec effets */}
        <div className="relative mb-12">
          <h1 className="mb-8 text-5xl font-black leading-tight text-white md:text-7xl lg:text-8xl">
            <span className="text-white">Bienvenue sur </span>
            <span className="text-[#A855F7]">GLHF</span>
            <br />
            <span className="text-3xl text-white md:text-5xl lg:text-6xl">
              Plateforme de tournoi en ligne
            </span>
          </h1>
          <Image
            src="/images/logo.webp"
            alt="GLHF, plateforme de tournois e-sports en ligne"
            width={300}
            height={300}
            className="group-hover:drop-shadow-2xl transition-all duration-300 mx-auto"
            priority
          />
        </div>

        {/* Paragraphes */}
        <div className="space-y-8 mb-16">
          <p className="text-2xl md:text-3xl lg:text-4xl leading-relaxed max-w-5xl mx-auto font-light text-white">
            Rejoignez la <span className="text-[#8F60D0] font-bold">plateforme ultime</span> pour
            organiser et participer à des tournois de jeux vidéo en ligne.
          </p>
          <p className="text-2xl md:text-2xl lg:text-3xl text-white max-w-4xl mx-auto font-light">
            Créez vos propres compétitions, affrontez d&apos;autres joueurs et{" "}
            <span className="text-[#8F60D0] font-bold">montez dans le classement</span> !
          </p>
          <p className="mx-auto max-w-5xl text-lg leading-relaxed text-white md:text-xl">
            GLHF centralise les inscriptions, les tableaux a elimination directe, le suivi des
            matchs et la visibilite des tournois e-sports pour aider joueurs et organisateurs a
            avancer plus vite.
          </p>
        </div>

        {/* Bouton d'appel à l'action */}
        <div className="relative">
          <Link href={primaryCtaHref} className={linkButtonClass + " text-2xl"}>
            <span className="relative z-10 flex items-center gap-2">Entre dans l&apos;arène</span>
          </Link>
        </div>
      </div>

      {/* Dégradé bas */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#232426] to-transparent"></div>
    </div>
  );
}
