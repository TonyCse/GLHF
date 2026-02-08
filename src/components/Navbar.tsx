"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Home,
  List,
  PlusCircle,
  Trophy,
  CreditCard,
  LogIn,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

const LINK_CLASS =
  "flex items-center text-xl text-white hover:text-[#8F60D0] transition-all duration-300 hover:scale-105";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [planName, setPlanName] = useState<string | null>(null);

  // Helper pour éviter les soucis de types côté client
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  useEffect(() => {
    let isActive = true;
    const fetchUser = async () => {
      if (!session?.user?.email) return;
      try {
        const res = await fetch(`/api/user?email=${session.user.email}`);
        if (!res.ok || !isActive) return;
        const data = await res.json();
        if (!isActive) return;
        if (data?.avatarUrl) setAvatarUrl(data.avatarUrl.replace("/svg?", "/png?"));
        if (data?.plan?.name) setPlanName(data.plan.name);
      } catch (err) {
        if (isActive) {
          console.error("Erreur de r?cup?ration de l'utilisateur :", err);
        }
      }
    };
    fetchUser();

    return () => {
      isActive = false;
    };
  }, [session]);

  if (status === "loading") return null;

  return (
    <nav className="fixed top-0 w-full z-50">
      <div
        className="
        py-4 px-6 transition-all duration-500 ease-in-out
        bg-[#1c1d1f] shadow-lg
      "
      >

        <div className="flex justify-between items-center max-w-7xl mx-auto relative text-[#8F60D0]">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 group hover:scale-105 transition-all duration-300"
            aria-label="Retour a l'accueil"
          >
            <div className="relative">
              <Image
                src="/images/logo.webp"
                alt="GLHF Logo"
                width={80}
                height={80}
                className="object-contain filter drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300"
              />
              <div className="absolute inset-0 bg-[#8F60D0]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
          </Link>

          {/* Menu desktop */}
          {session?.user && (
            <div className="hidden min-[800px]:flex space-x-8">
              <Link href="/" className={LINK_CLASS}>
                <Home className="mr-2" size={24} />
                <span className="relative">
                  Accueil
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#8F60D0] to-[#A855F7] transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>
              <Link href="/tournois" className={LINK_CLASS}>
                <List className="mr-2" size={24} />
                <span className="relative">
                  Tournois
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#8F60D0] to-[#A855F7] transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>
              <Link href="/abonnements" className={LINK_CLASS}>
                <CreditCard className="mr-2" size={24} />
                <span className="relative">
                  Forfaits
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#8F60D0] to-[#A855F7] transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>
              <Link href="/create" className={LINK_CLASS}>
                <PlusCircle className="mr-2" size={24} />
                <span className="relative">
                  Créer
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#8F60D0] to-[#A855F7] transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>
              <Link href="/ranking" className={LINK_CLASS}>
                <Trophy className="mr-2" size={24} />
                <span className="relative">
                  Classement
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#8F60D0] to-[#A855F7] transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>

              {/* Lien ADMIN (desktop) */}
              {isAdmin && (
                <Link href="/admin" className={LINK_CLASS}>
                  <span className="relative">
                    Admin
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#8F60D0] to-[#A855F7] transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </Link>
              )}
            </div>
          )}

          {/* Profil / Connexion desktop */}
          <div className="hidden min-[800px]:flex items-center space-x-4">
            {session?.user ? (
              <>
                <Link
                  href="/profil"
                  className="flex items-center space-x-3 text-white hover:text-[#8F60D0] transition-all duration-300 hover:scale-105 group"
                >
                  {avatarUrl && avatarUrl.trim() !== "" && (
                    <div className="relative">
                      <Image
                        src={avatarUrl}
                        alt="avatar"
                        width={45}
                        height={45}
                        className="rounded-full border-2 border-[#8F60D0] bg-gradient-to-br from-[#8F60D0] to-[#2e2640] group-hover:border-white transition-all duration-300"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8F60D0]/20 to-[#A855F7]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xl font-medium">{session.user.pseudo ?? session.user.name}</span>
                    {planName && <span className="text-sm text-gray-300">{planName}</span>}
                  </div>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-2 hover:text-[#8F60D0] transition-all duration-300 hover:scale-110 hover:bg-white/10 rounded-lg backdrop-blur-sm cursor-pointer"
                  aria-label="Se deconnecter"
                  title="Se deconnecter"
                >
                  <LogOut size={24} />
                </button>
              </>
            ) : (
              <Link
                href="/signin"
                className="flex items-center text-white hover:text-white px-6 py-3 rounded-xl bg-gradient-to-r from-[#8F60D0] to-[#A855F7] hover:from-[#A855F7] hover:to-[#8F60D0] font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 border border-[#8F60D0]/30 hover:border-white/20 backdrop-blur-sm transition-all duration-300"
              >
                <LogIn className="mr-2" size={20} /> Connexion
              </Link>
            )}
          </div>

          {/* Menu mobile toggle */}
          <button
            className="min-[800px]:hidden text-white z-50 relative p-2 hover:bg-white/10 rounded-lg transition-all duration-300"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 h-full w-72 text-white z-[60] transform transition-all duration-500 ease-in-out shadow-2xl border-l border-white/20 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } bg-[#1c1d1f]`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#8F60D0]/20 via-transparent to-[#A855F7]/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        <div className="p-6 flex flex-col space-y-6 pt-20 relative">
          {session?.user && (
            <>
              <Link href="/" className={`${LINK_CLASS} p-3 rounded-lg hover:bg-white/10 backdrop-blur-sm`} onClick={() => setIsOpen(false)}>
                <Home className="mr-3" size={24} /> Accueil
              </Link>
              <Link href="/tournois" className={`${LINK_CLASS} p-3 rounded-lg hover:bg-white/10 backdrop-blur-sm`} onClick={() => setIsOpen(false)}>
                <List className="mr-3" size={24} /> Tournois
              </Link>
              <Link href="/create" className={`${LINK_CLASS} p-3 rounded-lg hover:bg-white/10 backdrop-blur-sm`} onClick={() => setIsOpen(false)}>
                <PlusCircle className="mr-3" size={24} /> Créer
              </Link>
              <Link href="/ranking" className={`${LINK_CLASS} p-3 rounded-lg hover:bg-white/10 backdrop-blur-sm`} onClick={() => setIsOpen(false)}>
                <Trophy className="mr-3" size={24} /> Classement
              </Link>
              <Link href="/abonnements" className={`${LINK_CLASS} p-3 rounded-lg hover:bg-white/10 backdrop-blur-sm`} onClick={() => setIsOpen(false)}>
                <CreditCard className="mr-3" size={24} /> Forfaits
              </Link>

              {/* Lien ADMIN (mobile) */}
              {isAdmin && (
                <Link href="/admin" className={`${LINK_CLASS} p-3 rounded-lg hover:bg-white/10 backdrop-blur-sm`} onClick={() => setIsOpen(false)}>
                  Admin
                </Link>
              )}

              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4"></div>

              <Link href="/profil" className={`${LINK_CLASS} p-3 rounded-lg hover:bg-white/10 backdrop-blur-sm`} onClick={() => setIsOpen(false)}>
                {avatarUrl && avatarUrl.trim() !== "" && (
                  <Image
                    src={avatarUrl}
                    alt="avatar"
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-[#8F60D0] bg-[#8F60D0] mr-3"
                  />
                )}
                {session.user.pseudo ?? session.user.name}
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className={`${LINK_CLASS} p-3 rounded-lg hover:bg-red-500/20 backdrop-blur-sm text-left w-full cursor-pointer`}
              >
                <LogOut className="mr-3" size={24} /> Déconnexion
              </button>
            </>
          )}
          {!session?.user && (
            <Link
              href="/signin"
              className="flex items-center text-white hover:text-white p-4 rounded-xl bg-gradient-to-r from-[#8F60D0] to-[#A855F7] hover:from-[#A855F7] hover:to-[#8F60D0] font-semibold text-center shadow-lg hover:shadow-xl transform hover:scale-105 border border-[#8F60D0]/30 hover:border-white/20 transition-all duration-300"
              onClick={() => setIsOpen(false)}
            >
              <LogIn className="mr-3" size={20} /> Connexion
            </Link>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] min-[800px]:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </nav>
  );
}

