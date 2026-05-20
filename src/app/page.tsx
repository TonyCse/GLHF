import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import HomeFaqAccordion from "@/components/HomeFaqAccordion";
import HomeHero from "@/components/HomeHero";
import HomeStatsSection from "@/components/HomeStatsSection";
import ScrollReveal from "@/components/ScrollReveal";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "GLHF | Plateforme de tournois gaming et esports en ligne",
  description:
    "Creez, rejoignez et organisez des tournois esports sur League of Legends, Valorant, Overwatch et plus.",
};

const HOME_GAMES = [
  {
    game: "LEAGUE_OF_LEGENDS",
    title: "League of Legends",
    bg: "/images/lol_bg.webp",
    icon: "/images/lol_icon.webp",
    iconW: 400,
    iconH: 100,
  },
  {
    game: "VALORANT",
    title: "Valorant",
    bg: "/images/valorant_bg.webp",
    icon: "/images/valorant_icon.webp",
    iconW: 230,
    iconH: 100,
  },
  {
    game: "OVERWATCH",
    title: "Overwatch",
    bg: "/images/ow_bg.webp",
    icon: "/images/ow_logo.webp",
    iconW: 220,
    iconH: 100,
  },
  {
    game: "FALL_GUYS",
    title: "Fall Guys",
    bg: "/images/fg_bg.webp",
    icon: "/images/fg_icon.webp",
    iconW: 270,
    iconH: 100,
  },
  {
    game: "MARVELS_RIVALS",
    title: "Marvel's Rivals",
    bg: "/images/marvel_bg.webp",
    icon: "/images/marvel_logo.webp",
    iconW: 250,
    iconH: 100,
  },
  {
    game: "MINECRAFT",
    title: "Minecraft",
    bg: "/images/minecraft_bg.webp",
    icon: "/images/minecraft_icon.webp",
    iconW: 250,
    iconH: 100,
  },
];

const HOME_FAQS = [
  {
    question: "Comment participer a un tournoi ?",
    answer:
      "Il vous suffit de creer un compte gratuit, parcourir les tournois disponibles et cliquer sur Rejoindre. Suivez ensuite les instructions specifiques a chaque tournoi pour confirmer votre presence et vous preparer au debut du bracket.",
    icon: "🎯",
  },
  {
    question: "Quels sont les jeux supportes ?",
    answer:
      "Nous supportons les jeux les plus populaires : League of Legends, Valorant, Overwatch, Fall Guys, Marvel's Rivals, Minecraft et d'autres titres a venir selon la demande de la communaute.",
    icon: "🎮",
  },
  {
    question: "L'inscription est-elle gratuite ?",
    answer:
      "Absolument. L'inscription sur GLHF est gratuite. La plupart de nos tournois sont egalement gratuits, avec quelques evenements premium ou des usages de tokens selon le format propose.",
    icon: "💰",
  },
  {
    question: "Comment fonctionnent les brackets sur GLHF ?",
    answer:
      "Chaque tournoi utilise un arbre clair pour visualiser les rencontres, les qualifications et la progression jusqu'a la finale. Les joueurs peuvent suivre l'avancement du bracket directement depuis la page du tournoi, sans changer d'outil.",
    icon: "🏆",
  },
  {
    question: "Pourquoi Discord reste-t-il utilise avec GLHF ?",
    answer:
      "GLHF gere l'inscription, le suivi et la structure du tournoi, tandis que Discord reste pratique pour les vocaux, la coordination rapide entre joueurs et les confirmations de matchs entre participants ou organisateurs.",
    icon: "💬",
  },
  {
    question: "Que se passe-t-il quand un tournoi est complet ?",
    answer:
      "Quand le nombre maximal de joueurs est atteint, le tournoi passe automatiquement en statut complet. Les participants inscrits peuvent encore consulter les informations, suivre le bracket et attendre le demarrage officiel des matchs.",
    icon: "📋",
  },
];

function buildTestimonialAvatar(seed: string, options: Record<string, string>) {
  const params = new URLSearchParams({ seed, ...options });
  return `https://api.dicebear.com/9.x/lorelei/png?${params.toString()}`;
}

const TESTIMONIAL_AVATARS = {
  anthony: buildTestimonialAvatar("Anthony Marinier", {
    hair: "variant20",
    mouth: "happy05",
    beardProbability: "0",
    earringsProbability: "0",
    glassesProbability: "0",
  }),
  thomas: buildTestimonialAvatar("Thomas", {
    hair: "variant04",
    mouth: "happy01",
    glasses: "variant01",
    glassesProbability: "100",
    beardProbability: "0",
    earringsProbability: "0",
  }),
};

async function getHomeStatsCounts(now: Date) {
  try {
    const [openTournaments, registeredPlayers, crownedChampions] = await Promise.all([
      prisma.tournament.count({
        where: {
          isDeleted: false,
          winnerId: null,
          date: { gt: now },
        },
      }),
      prisma.user.count({
        where: {
          isDeleted: false,
        },
      }),
      prisma.tournament.count({
        where: {
          isDeleted: false,
          winnerId: { not: null },
        },
      }),
    ]);

    return { openTournaments, registeredPlayers, crownedChampions };
  } catch (error) {
    const message = error instanceof Error ? error.message.split("\n")[0] : "Unknown error";
    console.warn(`Unable to load home stats: ${message}`);
    return { openTournaments: 0, registeredPlayers: 0, crownedChampions: 0 };
  }
}

export default async function Home() {
  const session = await auth();
  const isAuthed = Boolean(session?.user);
  const now = new Date();
  const { openTournaments, registeredPlayers, crownedChampions } = await getHomeStatsCounts(now);

  const getGameHref = (game: string) => (isAuthed ? `/tournois?game=${game}` : "/connexion");
  const primaryCtaHref = isAuthed ? "/tournois" : "/inscription";
  const linkButtonClass =
    "btn-neon relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-linear-to-r from-[#8F60D0] to-[#A855F7] px-10 py-5 font-bold text-white shadow-lg transition-all duration-300 group";
  const revealCardClass =
    "opacity-0 translate-y-6 transition duration-700 ease-out will-change-transform motion-reduce:opacity-100 motion-reduce:translate-y-0";

  const homeStats = [
    {
      icon: "trophy" as const,
      label: "Tournois ouverts",
      value: openTournaments,
      detail: "Disponibles maintenant",
      iconClass: "text-yellow-400",
      valueGradient: "from-yellow-400 to-orange-500",
    },
    {
      icon: "users" as const,
      label: "Joueurs inscrits",
      value: registeredPlayers,
      detail: "Communaute GLHF",
      iconClass: "text-blue-400",
      valueGradient: "from-blue-400 to-purple-500",
    },
    {
      icon: "crown" as const,
      label: "Champions couronnes",
      value: crownedChampions,
      detail: "Tournois termines",
      iconClass: "text-green-400",
      valueGradient: "from-green-400 to-teal-500",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center bg-[#232426] text-white">
      <ScrollReveal />

      <HomeHero primaryCtaHref={primaryCtaHref} linkButtonClass={linkButtonClass} />

      <div className="content-auto mx-auto mb-12 w-full max-w-7xl px-4 sm:w-[90%]">
        <div className="rounded-2xl border border-[#8F60D0]/20 bg-linear-to-r from-[#1c1d1f] to-[#24252a] p-8 text-center shadow-xl">
          <h2 className="relative mb-4 text-3xl font-bold">
            <span className="text-[#8F60D0]">GLHF</span>
            <span className="text-white"> + Discord</span>
          </h2>
          <p className="mx-auto max-w-4xl text-xl leading-relaxed text-white md:text-2xl">
            GLHF organise le tournoi et structure les inscriptions, l&apos;arbre et le suivi. Discord
            reste l&apos;espace de coordination, de vocal et de retour joueur sur les matchs, pour un
            fonctionnement fluide avant, pendant et apres la competition.
          </p>
        </div>
      </div>

      <div className="content-auto mx-auto mb-20 w-full max-w-7xl px-4 text-center sm:w-[90%]">
        <div className="mb-16">
          <h2 className="relative mb-4 text-4xl font-bold md:text-5xl">
            <span className="text-white">Pourquoi choisir </span>
            <span className="text-[#8F60D0]">GLHF</span>&nbsp;?
          </h2>
          <p className="mx-auto max-w-2xl text-2xl text-white">
            Decouvrez les fonctionnalites qui font de GLHF une plateforme pratique pour organiser,
            suivre et faire vivre des tournois gaming en ligne.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div
            data-reveal
            className={`${revealCardClass} rounded-xl border border-[#8F60D0]/20 bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 shadow-xl transition-all duration-300 hover:border-[#8F60D0]/40 hover:shadow-2xl`}
          >
            <div className="mb-4 text-5xl" aria-hidden="true">⚡</div>
            <h3 className="mb-4 text-2xl font-semibold text-[#8F60D0] md:text-3xl">
              Organisation facile
            </h3>
            <p className="text-2xl leading-relaxed text-white">
              Creez et gerez vos tournois en quelques clics avec une interface intuitive et
              moderne. Les informations essentielles restent centralisees pour aider organisateurs
              et joueurs a gagner du temps a chaque etape.
            </p>
          </div>

          <div
            data-reveal
            className={`${revealCardClass} rounded-xl border border-[#A855F7]/20 bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 shadow-xl transition-all duration-300 hover:border-[#A855F7]/40 hover:shadow-2xl`}
          >
            <div className="mb-4 text-5xl" aria-hidden="true">📊</div>
            <h3 className="mb-4 text-2xl font-semibold text-[#A855F7] md:text-3xl">
              Classements dynamiques
            </h3>
            <p className="text-2xl leading-relaxed text-white">
              Suivez votre progression en temps reel et comparez-vous aux meilleurs joueurs de la
              communaute. Les profils, historiques et resultats donnent une vue plus claire de la
              performance globale sur la plateforme.
            </p>
          </div>

          <div
            data-reveal
            className={`${revealCardClass} rounded-xl border border-[#8F60D0]/20 bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 shadow-xl transition-all duration-300 hover:border-[#8F60D0]/40 hover:shadow-2xl`}
          >
            <div className="mb-4 text-5xl" aria-hidden="true">🎮</div>
            <h3 className="mb-4 text-2xl font-semibold text-[#8F60D0] md:text-3xl">
              Communaute engagee
            </h3>
            <p className="text-2xl leading-relaxed text-white">
              Rejoignez une communaute passionnee et participez a des evenements reguliers. GLHF
              simplifie la rencontre entre joueurs competitifs, organisateurs et scenes locales ou
              communautaires.
            </p>
          </div>
        </div>
      </div>

      <div className="content-auto mx-auto mb-20 w-full max-w-7xl px-4 text-center sm:w-[90%]">
        <div className="mb-16">
          <h2 className="relative mb-4 text-4xl font-bold md:text-5xl">
            Ce que disent nos utilisateurs
          </h2>
          <p className="mx-auto max-w-2xl text-2xl text-white">
            Decouvrez les retours de notre communaute grandissante
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div
            data-reveal
            className={`${revealCardClass} rounded-xl border border-[#8F60D0]/20 bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 shadow-xl transition-all duration-300 hover:border-[#8F60D0]/40`}
          >
            <p className="mb-6 text-2xl italic leading-relaxed text-white md:text-xl">
              Une interface intuitive et des fonctionnalites puissantes, j&apos;adore. La gestion des
              tournois n&apos;a jamais ete aussi simple pour lancer une competition et garder de la
              visibilite sur chaque etape.
            </p>
            <div className="flex items-center justify-center space-x-3">
              <div className="relative h-12 w-12">
                <Image
                  src={TESTIMONIAL_AVATARS.anthony}
                  alt="Avatar joueur GLHF Anthony Marinier"
                  width={48}
                  height={48}
                  className="h-full w-full rounded-full border-2 border-[#8F60D0] bg-linear-to-br from-[#8F60D0] to-[#2e2640] object-cover"
                />
                <div className="absolute inset-0 rounded-full bg-linear-to-r from-[#8F60D0]/20 to-[#A855F7]/20 blur-sm" />
              </div>
              <div className="text-left">
                <span className="block text-2xl font-semibold text-[#8F60D0]">Anthony M.</span>
                <span className="text-md text-white">Joueur competitif</span>
              </div>
            </div>
          </div>

          <div
            data-reveal
            className={`${revealCardClass} rounded-xl border border-[#A855F7]/20 bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 shadow-xl transition-all duration-300 hover:border-[#A855F7]/40`}
          >
            <p className="mb-6 text-2xl italic leading-relaxed text-white md:text-xl">
              GLHF a revolutionne la facon dont nous organisons nos tournois. La page de tournoi,
              le bracket et le suivi des participants rendent la coordination beaucoup plus claire.
            </p>
            <div className="flex items-center justify-center space-x-3">
              <div className="relative h-12 w-12">
                <Image
                  src={TESTIMONIAL_AVATARS.thomas}
                  alt="Avatar organisateur GLHF Thomas"
                  width={48}
                  height={48}
                  className="h-full w-full rounded-full border-2 border-[#8F60D0] bg-linear-to-br from-[#8F60D0] to-[#2e2640] object-cover"
                />
                <div className="absolute inset-0 rounded-full bg-linear-to-r from-[#8F60D0]/20 to-[#A855F7]/20 blur-sm" />
              </div>
              <div className="text-left">
                <span className="block text-2xl font-semibold text-[#A855F7]">Thomas C.</span>
                <span className="text-md text-white">Organisateur d&apos;evenements</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-auto mx-auto mb-20 w-full max-w-7xl px-4 py-16 text-center sm:w-[90%]">
        <div>
          <h2 className="relative mb-16 text-4xl font-bold md:text-5xl">
            Decouvrez notre catalogue de jeux
          </h2>

          <div className="xl:hidden">
            <div
              role="region"
              aria-label="Catalogue de jeux — glissez pour explorer"
              className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-10 pt-20"
            >
              {HOME_GAMES.map(({ game, title, bg, icon, iconW, iconH }) => (
                <Link
                  key={game}
                  href={getGameHref(game)}
                  data-reveal
                  className={`${revealCardClass} group relative flex h-56 min-w-[85%] snap-center items-end overflow-visible rounded-xl bg-cover bg-top bg-no-repeat shadow-lg after:absolute after:inset-0 after:rounded-xl after:bg-[#272727] after:opacity-60 sm:min-w-[65%] focus:outline-none focus:ring-2 focus:ring-[#8F60D0] focus:ring-offset-2 focus:ring-offset-[#232426]`}
                  style={{ backgroundImage: `url('${bg}')` }}
                >
                  <div className="absolute inset-0 rounded-xl bg-linear-to-t from-[#121315] via-transparent to-transparent" />
                  <h3 className="z-10 mb-5 ml-4 text-left text-2xl font-semibold text-white transition-all duration-300 group-hover:scale-95">
                    {title}
                  </h3>
                  <Image
                    src={icon}
                    width={iconW}
                    height={iconH}
                    alt={`Tournoi ${title} sur GLHF`}
                    className="z-1 absolute -right-2 bottom-0 bg-contain bg-no-repeat p-0 transition-all duration-300 group-hover:scale-105"
                  />
                </Link>
              ))}
            </div>
            <p className="mt-3 text-sm uppercase tracking-[0.28em] text-white/40">
              Swipe pour explorer les jeux
            </p>
          </div>

          <div className="hidden grid-cols-1 grid-rows-3 gap-25 xl:grid xl:grid-cols-2">
            {HOME_GAMES.map(({ game, title, bg, icon, iconW, iconH }) => (
              <Link
                key={game}
                href={getGameHref(game)}
                data-reveal
                className={`${revealCardClass} group relative flex h-50 w-full cursor-pointer items-center rounded-lg bg-cover bg-top bg-no-repeat shadow-lg after:absolute after:inset-0 after:rounded-lg after:bg-[#272727] after:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#8F60D0] focus:ring-offset-2 focus:ring-offset-[#232426]`}
                style={{ backgroundImage: `url('${bg}')` }}
              >
                <h3 className="z-10 my-auto mb-2.5 ml-2.5 text-3xl font-semibold text-white transition-all duration-300 group-hover:scale-80 md:ml-18">
                  {title}
                </h3>
                <Image
                  src={icon}
                  width={iconW}
                  height={iconH}
                  alt={`Tournoi ${title} sur GLHF`}
                  className="z-1 absolute right-0 bottom-0 origin-bottom-right bg-contain bg-no-repeat p-0 transition-all duration-300 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="content-auto mx-auto mb-20 w-full max-w-7xl px-4 text-center sm:w-[90%]">
        <div className="mb-16">
          <h2 className="relative mb-4 text-4xl font-bold md:text-5xl">Nos statistiques</h2>
          <p className="mx-auto max-w-3xl text-2xl text-white">
            Ces indicateurs donnent une lecture concrete de l&apos;activite sur GLHF : les tournois
            ouverts actuellement, la taille de la communaute et le volume de competitions deja
            menees jusqu&apos;au sacre d&apos;un champion.
          </p>
        </div>
        <HomeStatsSection stats={homeStats} />

      </div>

      <div className="content-auto mx-auto mb-20 w-full max-w-7xl px-4 text-center sm:w-[90%]">
        <div className="mb-16 text-center">
          <h2 className="relative mb-4 text-4xl font-bold md:text-5xl">
            FAQ • Questions frequentes
          </h2>
          <p className="mx-auto max-w-2xl text-2xl text-white">
            Trouvez rapidement les reponses a vos questions les plus courantes
          </p>
        </div>

        <HomeFaqAccordion items={HOME_FAQS} className="max-w-none" />
      </div>

      <div
        data-reveal
        className={`${revealCardClass} content-auto mx-auto mb-20 w-full max-w-7xl rounded-xl border border-[#8F60D0]/20 bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 px-4 text-center shadow-xl transition-all duration-300 hover:border-[#8F60D0]/40 hover:shadow-2xl sm:w-[90%]`}
      >
        <h2 className="relative mb-6 text-center text-3xl font-bold md:text-5xl">
          Pret a rejoindre la competition&nbsp;?
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-center text-2xl leading-relaxed text-white">
          Rejoignez des milliers de joueurs passionnes et commencez votre aventure esport des
          aujourd&apos;hui.
        </p>
        <div className="space-y-4 md:flex md:justify-center md:space-y-0 md:space-x-6">
          <Link href="/inscription" className={`${linkButtonClass} text-2xl`}>
            <span className="relative z-10 flex items-center gap-2">
              S&apos;inscrire gratuitement
            </span>
          </Link>
          <Link href="/tournois" className={`${linkButtonClass} text-2xl`}>
            <span className="relative z-10 flex items-center gap-2">Voir les tournois</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
