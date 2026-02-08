import Image from "next/image";
import Link from "next/link";
import { Users, Clock, Trophy } from "lucide-react";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  const isAuthed = Boolean(session?.user);
  const getGameHref = (game: string) =>
    isAuthed ? `/tournois?game=${game}` : "/signin";
  const primaryCtaHref = isAuthed ? "/tournois" : "/signup";
  const linkButtonClass =
    "relative inline-flex items-center justify-center px-10 py-5 overflow-hidden font-bold text-white rounded-xl bg-gradient-to-r from-[#8F60D0] to-[#A855F7] shadow-lg transition-all duration-300 group";

  return (
        <div className="bg-[#232426] text-white flex flex-col items-center justify-center">
          {/* Hero Section */}
          <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#232426] via-[#1a1b1d] to-[#2d2e32]"></div>
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Pixel style particles - Gaming theme */}
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
              
              {/* Pixel art style geometric shapes */}
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
              
              {/* Gaming icons in pixel style */}
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
              
              {/* Gradient orbs renforcés */}
              <div className="absolute top-32 left-2/4 w-32 h-32 bg-gradient-to-r from-[#8F60D0]/100 to-[#A855F7]/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-2/4 right-1/6 w-40 h-40 bg-gradient-to-r from-[#A855F7]/100 to-[#8F60D0]/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-3/4 left-1/4 w-24 h-24 bg-gradient-to-r from-[#8F60D0]/100 to-[#A855F7]/10 rounded-full blur-2xl animate-pulse delay-1500"></div>
            </div>

            {/* Main Hero Content */}
            <div className="relative z-10 text-center max-w-7xl mx-auto px-6 py-20">
              {/* Title with enhanced effects */}
              <div className="relative mb-12">
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black bg-clip-text bg-gradient-to-r from-[#8F60D0] via-[#A855F7] to-[#8F60D0] mb-8 leading-tight text-white">
                  Bienvenue sur <span className="text-[#A855F7]">GLHF</span>
                </h1>
                <Image 
                  src="/images/logo.webp" 
                  alt="glhf-logo"
                  width={300}
                  height={300}
                  className="group-hover:drop-shadow-2xl transition-all duration-300 mx-auto"
                  priority
                />
            
              </div>

              {/* Enhanced paragraphs */}
              <div className="space-y-8 mb-16">
                <p className="text-2xl md:text-3xl lg:text-4xl leading-relaxed max-w-5xl mx-auto font-light text-white">
                  Rejoignez la <span className="text-[#8F60D0] font-bold">plateforme ultime</span> pour organiser et participer à des tournois de jeux vidéo en ligne.
                </p>
                <p className="text-2xl md:text-2xl lg:text-3xl text-white max-w-4xl mx-auto font-light">
                  Créez vos propres compétitions, affrontez d&apos;autres joueurs et <span className="text-[#8F60D0] font-bold">montez dans le classement</span> !
                </p>
              </div>

              {/* Enhanced CTA Button */}
              <div className="relative">
            
                <Link href={primaryCtaHref} className={linkButtonClass + " text-2xl"}>
                  <span className="absolute top-0 left-0 w-1/3 h-full bg-white/20 blur-lg rotate-[20deg] -translate-x-full group-hover:translate-x-[220%] transition-transform duration-500"></span>
                  <span className="relative z-10 flex items-center gap-2">
                    Entre dans l&apos;arène
                  </span>
                </Link>
              </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#232426] to-transparent"></div>
          </div>
          
          {/* Section Fonctionnalités */}
          <div className="content-auto w-full max-w-7xl mx-auto px-4 sm:w-[90%] text-center mb-20">
            <div className="mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 relative">
                <span className="text-white">Pourquoi choisir </span>
                <span className="text-[#8F60D0]">GLHF</span>&nbsp;?
              </h2>
              <p className="text-2xl text-gray-400 max-w-2xl mx-auto">
                Découvrez les fonctionnalités qui font de GLHF la référence des tournois gaming
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl border border-[#8F60D0]/20 hover:border-[#8F60D0]/40">
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="text-2xl md:text-3xl font-semibold text-[#8F60D0] mb-4">Organisation facile</h3>
                <p className="text-2xl text-gray-300 leading-relaxed">Créez et gérez vos tournois en quelques clics avec une interface intuitive et moderne.</p>
              </div>
              <div className="bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl border border-[#A855F7]/20 hover:border-[#A855F7]/40">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-2xl md:text-3xl font-semibold text-[#A855F7] mb-4">Classements dynamiques</h3>
                <p className="text-2xl text-gray-300 leading-relaxed">Suivez votre progression en temps réel et comparez-vous aux meilleurs joueurs de la communauté.</p>
              </div>
              <div className="bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl border border-[#8F60D0]/20 hover:border-[#8F60D0]/40">
                <div className="text-5xl mb-4">🎮</div>
                <h3 className="text-2xl md:text-3xl font-semibold text-[#8F60D0] mb-4">Communauté engagée</h3>
                <p className="text-2xl text-gray-300 leading-relaxed">Rejoignez une communauté passionnée et participez à des événements exclusifs.</p>
              </div>
            </div>
          </div>
          
          {/* Section Témoignages */}
          <div className="content-auto w-full max-w-7xl mx-auto text-center mb-20 px-4 sm:w-[90%]">
            <div className="mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 relative">
                Ce que disent nos utilisateurs
              </h2>
              <p className="text-2xl text-gray-400 max-w-2xl mx-auto">
                Découvrez les retours de notre communauté grandissante
              </p>
            </div>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-3 border border-[#8F60D0]/20 hover:border-[#8F60D0]/40">

                <p className="text-2xl md:text-xl text-gray-300 italic leading-relaxed mb-6">
                  &quot;Une interface intuitive et des fonctionnalités puissantes, j&apos;adore ! La gestion des tournois n&apos;a jamais été aussi simple.&quot;
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#8F60D0] to-[#A855F7] rounded-full flex items-center justify-center text-white font-bold">A</div>
                  <div className="text-left">
                    <span className="block font-semibold text-[#8F60D0] text-2xl">Anthony M.</span>
                    <span className="text-gray-400 text-md">Joueur compétitif</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-3 border border-[#A855F7]/20 hover:border-[#A855F7]/40">

                <p className="text-2xl md:text-xl text-gray-300 italic leading-relaxed mb-6">
                  &quot;GLHF a révolutionné la façon dont nous organisons nos tournois. Super plateforme avec un support réactif !&quot;
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#A855F7] to-[#8F60D0] rounded-full flex items-center justify-center text-white font-bold">T</div>
                  <div className="text-left">
                    <span className="block font-semibold text-[#A855F7] text-2xl">Thomas C.</span>
                    <span className="text-gray-400 text-md">Organisateur d&apos;événements</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Catalogue des jeux */}
          <div className="content-auto w-full max-w-7xl mx-auto text-center mb-20 px-4 sm:w-[90%] py-16">
            <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-30 relative">
                  Découvrez notre catalogue de jeux
                </h2>
                <div className="grid grid-cols-1 grid-rows-3 gap-25 xl:grid-cols-2">
                {[
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
                    title: "Marvel's Rival",
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
                ].map(({ game, title, bg, icon, iconW, iconH }) => (
                  <Link
                    key={game}
                    href={getGameHref(game)}
                    className="w-full h-50 group cursor-pointer relative bg-cover bg-no-repeat bg-top rounded-lg shadow-lg flex items-center after:content-[''] after:absolute after:inset-0 after:bg-[#272727] after:opacity-60 after:rounded-lg"
                    style={{ backgroundImage: `url('${bg}')` }}
                  >
                    <h3 className="z-10 text-3xl font-semibold text-white ml-[10px] mb-[10px] my-auto md:ml-18 transition-all duration-300 transform group-hover:scale-80">
                      {title}
                    </h3>
                    <Image
                      src={icon}
                      width={iconW}
                      height={iconH}
                      alt={`${title} Icon`}
                      className="z-1 absolute right-0 bottom-0 p-0 bg-no-repeat bg-contain transition-all duration-300 transform group-hover:scale-105 origin-bottom-right"
                    />
                  </Link>
                  ))}
                </div>
              </div>
            </div>

            
            {/* Section Démonstration Produit
            <div className="content-auto w-full max-w-7xl mx-auto text-center mb-20 px-4 sm:w-[90%]">
                <div className="mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 relative">
                      Découvrez notre plateforme
                    </h2>
                    <p className="text-2xl text-gray-400 max-w-2xl mx-auto">
                        Regardez comment notre plateforme fonctionne et participez à des tournois en quelques clics
                    </p>
                </div>
                <video className="w-full max-w-4xl mx-auto rounded-xl" controls>
                    <source src=" " type="video/mp4" />
                    Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
            </div> */}
            
            {/* Section Statistiques */}
            <div className="content-auto w-full max-w-7xl mx-auto text-center mb-20 px-4 sm:w-[90%]">
                <div className="mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 relative">
                      Nos statistiques
                    </h2>
                    <p className="text-2xl text-gray-400 max-w-2xl mx-auto">
                        Des chiffres qui témoignent de notre croissance et de l&apos;engagement de notre communauté
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: <Trophy size={56} className="text-yellow-400" />, title: "Tournois organisés", value: "150+", gradient: "from-yellow-400 to-orange-500" },
                        { icon: <Users size={56} className="text-blue-400" />, title: "Joueurs inscrits", value: "10,000+", gradient: "from-blue-400 to-purple-500" },
                        { icon: <Clock size={56} className="text-green-400" />, title: "Participations tournois", value: "3,500+", gradient: "from-green-400 to-teal-500" },
                    ].map((stat, index) => (
                        <div key={index} className="bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl text-center flex flex-col items-center transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl border border-[#8F60D0]/20 hover:border-[#8F60D0]/40">
                            <div className="mb-6">{stat.icon}</div>
                            <h3 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                                {stat.value}
                            </h3>
                            <p className="text-gray-300 text-2xl font-medium">{stat.title}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section FAQ */}
            <div className="content-auto w-full max-w-7xl mx-auto text-center mb-20 px-4 sm:w-[90%]">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 relative">
                  FAQ • Questions fréquentes
                </h2>
                <p className="text-2xl text-gray-400 max-w-2xl mx-auto">
                  Trouvez rapidement les réponses à vos questions les plus courantes
                </p>
              </div>
              <div className="flex flex-col gap-8 items-center">
                {[
                  {
                    question: "Comment participer à un tournoi",
                    answer:
                      "Il vous suffit de créer un compte gratuit, parcourir les tournois disponibles et cliquer sur 'Rejoindre'. Suivez ensuite les instructions spécifiques à chaque tournoi.",
                    icon: "🎯",
                  },
                  {
                    question: "Quels sont les jeux supportés",
                    answer:
                      "Nous supportons les jeux les plus populaires : League of Legends, Valorant, Overwatch, Fall Guys, Marvel's Rivals, Minecraft et bien d'autres à venir !",
                    icon: "🎮",
                  },
                  {
                    question: "L'inscription est-elle gratuite",
                    answer:
                      "Absolument ! L'inscription sur GLHF est entièrement gratuite. La plupart de nos tournois sont également gratuits, avec quelques événements premium optionnels.",
                    icon: "💰",
                  },
                ].map((faq, index) => (
                  <div
                    key={index}
                    className="w-full bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl border border-[#8F60D0]/20 hover:border-[#8F60D0]/40"
                  >
                    <div className="text-5xl mb-4">{faq.icon}</div>
                    <h3 className="text-2xl md:text-3xl font-semibold text-[#8F60D0] mb-4">
                      {faq.question}
                    </h3>
                    <p className="text-2xl text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>



          
          {/* Call to Action Final */}
          <div className="content-auto w-full max-w-7xl mx-auto sm:w-[90%] px-4 text-center mb-20 bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl border border-[#8F60D0]/20 hover:border-[#8F60D0]/40">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 relative text-center">
              Prêt à rejoindre la compétition&nbsp;?
            </h2>
            <p className="text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed text-center">
              Rejoignez des milliers de joueurs passionnés et commencez votre aventure esport dès aujourd&apos;hui !
            </p>
            <div className="space-y-4 md:space-y-0 md:space-x-6 md:flex md:justify-center">
              <Link href="/signup" className={linkButtonClass + " text-2xl"}>
                <span className="absolute top-0 left-0 w-1/3 h-full bg-white/20 blur-lg rotate-[20deg] -translate-x-full group-hover:translate-x-[220%] transition-transform duration-500"></span>
                <span className="relative z-10 flex items-center gap-2">
                  S&apos;inscrire gratuitement
                </span>
              </Link>
              <Link href="/tournois" className={linkButtonClass + " text-2xl"}>
                <span className="absolute top-0 left-0 w-1/3 h-full bg-white/20 blur-lg rotate-[20deg] -translate-x-full group-hover:translate-x-[220%] transition-transform duration-500"></span>
                <span className="relative z-10 flex items-center gap-2">
                  Voir les tournois
                </span>
              </Link>
            </div>
          </div>
        </div>
      );
    }
