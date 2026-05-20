"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { LucideIcon } from "lucide-react";
import { CreditCard, Home, List, LogIn, LogOut, Menu, PlusCircle, Shield, Trophy, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDialog } from "@/components/DialogProvider";

const LINK_CLASS =
  "group flex items-center text-xl text-white transition-all duration-300 hover:scale-105 hover:text-[#8F60D0]";

type NavItem = {
  href: string;
  label: string;
  detail: string;
  icon: LucideIcon;
};

const PRIMARY_LINKS: NavItem[] = [
  { href: "/", label: "Accueil", detail: "Hub principal", icon: Home },
  { href: "/tournois", label: "Tournois", detail: "Matchs en cours", icon: List },
  { href: "/abonnements", label: "Forfaits", detail: "Tokens et plans", icon: CreditCard },
  { href: "/creer", label: "Créer", detail: "Lancer un bracket", icon: PlusCircle },
  { href: "/classement", label: "Classement", detail: "Top joueurs", icon: Trophy },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [planName, setPlanName] = useState<string | null>(null);
  const { confirm } = useDialog();
  const isOpen = openPathname === pathname;
  const asideRef = useRef<HTMLElement>(null);

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  const mobileLinks = useMemo(() => {
    const links = session?.user
      ? [...PRIMARY_LINKS]
      : PRIMARY_LINKS.filter((item) => item.href !== "/creer");

    if (isAdmin) {
      links.push({
        href: "/admin",
        label: "Admin",
        detail: "Contrôle et modération",
        icon: Shield,
      });
    }

    return links;
  }, [session?.user, isAdmin]);

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
      } catch {
        // Silently ignore fetch errors
      }
    };

    fetchUser();

    return () => {
      isActive = false;
    };
  }, [session]);

  useEffect(() => {
    const handleAvatarUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ avatarUrl?: string }>).detail;
      if (!detail?.avatarUrl || !detail.avatarUrl.startsWith("https://api.dicebear.com/")) return;
      setAvatarUrl(detail.avatarUrl.replace("/svg?", "/png?"));
    };

    window.addEventListener("glhf:avatar-updated", handleAvatarUpdate);
    return () => window.removeEventListener("glhf:avatar-updated", handleAvatarUpdate);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const aside = asideRef.current;
    if (aside) {
      const focusable = aside.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      first?.focus();

      const trapFocus = (e: KeyboardEvent) => {
        if (e.key === "Escape") { setOpenPathname(null); return; }
        if (e.key !== "Tab") return;
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      };

      aside.addEventListener("keydown", trapFocus);
      return () => {
        document.body.style.overflow = previousOverflow;
        aside.removeEventListener("keydown", trapFocus);
      };
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPathname(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (status === "loading") return null;

  const isActiveLink = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const handleSignOut = async (closeMenu?: boolean) => {
    const ok = await confirm({
      title: "Se déconnecter ?",
      description: "Es-tu sûr de vouloir te déconnecter ?",
      confirmText: "Se déconnecter",
      cancelText: "Annuler",
      variant: "danger",
    });
    if (!ok) return;
    if (closeMenu) setOpenPathname(null);
    signOut({ callbackUrl: "/" });
  };

  const renderDesktopLink = ({ href, label, icon: Icon }: NavItem) => (
    <Link key={href} href={href} className={LINK_CLASS}>
      <Icon className="mr-2" size={24} />
      <span>{label}</span>
    </Link>
  );

  const renderMobileLink = ({ href, label, icon: Icon }: NavItem) => {
    const active = isActiveLink(href);

    return (
      <Link
        key={href}
        href={href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-lg transition-colors ${
          active
            ? "bg-[#8F60D0] text-white font-medium"
            : "text-white hover:bg-[#232426] hover:text-white"
        }`}
        onClick={() => setOpenPathname(null)}
      >
        <Icon size={18} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 z-50 w-full">
      <div className="hidden min-[800px]:block">
        <div className="border-b border-white/8 bg-[#16171a]/92 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(143,96,208,0.18),transparent_42%)]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-[#8F60D0]/45 to-transparent" />

          <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 text-[#8F60D0] sm:px-6">
            <Link
              href="/"
              className="group flex items-center gap-3 transition-all duration-300 hover:scale-[1.02]"
              aria-label="Retour à l'accueil"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#8F60D0]/30 blur-2xl opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
                <Image
                  src="/images/logo.webp"
                  alt="Logo GLHF, plateforme de tournois e-sports"
                  width={68}
                  height={68}
                  className="relative object-contain drop-shadow-[0_8px_24px_rgba(143,96,208,0.3)]"
                />
              </div>
            </Link>

            {session?.user && (
              <div className="flex space-x-8">
                {PRIMARY_LINKS.map(renderDesktopLink)}

                {isAdmin && (
                  <Link href="/admin" className={LINK_CLASS}>
                    <span>Admin</span>
                  </Link>
                )}
              </div>
            )}

            <div className="flex items-center space-x-4">
              {session?.user ? (
                <>
                  <Link
                    href="/profil"
                    className="group flex items-center space-x-3 text-white transition-all duration-300 hover:scale-105 hover:text-[#8F60D0]"
                  >
                    {avatarUrl && avatarUrl.trim() !== "" && (
                      <div className="relative">
                        <Image
                          src={avatarUrl}
                          alt="Mon avatar"
                          width={45}
                          height={45}
                          className="rounded-full border-2 border-[#8F60D0] bg-linear-to-br from-[#8F60D0] to-[#2e2640] transition-all duration-300 group-hover:border-white"
                        />
                        <div className="absolute inset-0 rounded-full bg-linear-to-r from-[#8F60D0]/20 to-[#A855F7]/20 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-xl font-medium">
                        {session.user.pseudo ?? session.user.name}
                      </span>
                      {planName && <span className="text-sm text-white">{planName}</span>}
                    </div>
                  </Link>
                  <button
                    onClick={() => handleSignOut()}
                    className="btn-plain rounded-lg p-2 transition-all duration-300 hover:scale-110 hover:bg-white/10 hover:text-[#8F60D0]"
                    aria-label="Se déconnecter"
                    title="Se déconnecter"
                  >
                    <LogOut size={24} />
                  </button>
                </>
              ) : (
                <Link
                  href="/connexion"
                  className="btn-neon flex items-center rounded-xl border border-[#8F60D0]/30 bg-linear-to-r from-[#8F60D0] to-[#A855F7] px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:border-white/20 hover:text-white"
                >
                  <LogIn className="mr-2" size={20} /> Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="min-[800px]:hidden border-b border-[#2a2c30] bg-[#1c1d1f]">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="w-6" />
          <Link href="/" aria-label="Retour à l'accueil" onClick={() => setOpenPathname(null)}>
            <Image
              src="/images/logo.webp"
              alt="Logo GLHF, plateforme de tournois e-sports"
              width={44}
              height={44}
              className="object-contain"
            />
          </Link>
          <button
            onClick={() => setOpenPathname(pathname)}
            className="text-white transition-colors hover:text-white"
            aria-label="Ouvrir le menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`fixed inset-y-0 right-0 z-60 min-[800px]:hidden ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      >
        <aside
          ref={asideRef}
          className={`flex h-full w-64 flex-col border-l border-[#2a2c30] bg-[#1c1d1f] p-5 shadow-2xl transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <Link href="/" aria-label="Retour à l'accueil" onClick={() => setOpenPathname(null)}>
              <Image
                src="/images/logo.webp"
                alt="Logo GLHF, plateforme de tournois e-sports"
                width={52}
                height={52}
                className="object-contain"
              />
            </Link>
            <button
              onClick={() => setOpenPathname(null)}
              className="text-white transition-colors hover:text-white"
              aria-label="Fermer le menu"
            >
              <X size={22} />
            </button>
          </div>

          {session?.user ? (
            <div className="mb-5 rounded-lg border border-[#2a2c30] bg-[#232426] p-3">
              <div className="flex items-center gap-3">
                {avatarUrl && avatarUrl.trim() !== "" ? (
                  <Image
                    src={avatarUrl}
                    alt="Mon avatar"
                    width={44}
                    height={44}
                    className="rounded-full border border-[#8F60D0]/45 bg-[#211b2f]"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#8F60D0]/45 bg-[#211b2f] text-sm font-bold text-[#d6bcff]">
                    {(session.user.pseudo ?? session.user.name ?? "G").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <Link
                    href="/profil"
                    className="block truncate font-semibold text-white"
                    onClick={() => setOpenPathname(null)}
                  >
                    {session.user.pseudo ?? session.user.name}
                  </Link>
                  <p className="text-sm text-white">{planName ?? "Plan gratuit"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-5 rounded-lg border border-[#2a2c30] bg-[#232426] p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-[#8F60D0]">Good luck, have fun</p>
              <p className="mt-2 text-base font-semibold text-white">Entre dans l&apos;arène GLHF</p>
              <p className="mt-2 text-sm leading-6 text-white">
                Accède aux tournois, aux classements et aux forfaits depuis le menu mobile.
              </p>
            </div>
          )}

          <nav className="space-y-1">{mobileLinks.map(renderMobileLink)}</nav>

          <div className="mt-auto pt-5">
            {session?.user ? (
              <button
                onClick={() => handleSignOut(true)}
                className="flex w-full items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-100 transition-colors hover:bg-red-500/18"
              >
                <LogOut className="mr-2" size={18} />
                Déconnexion
              </button>
            ) : (
              <Link
                href="/connexion"
                className="block w-full rounded-lg bg-[#8F60D0] px-4 py-3 text-center font-medium text-white transition-colors hover:bg-[#A855F7]"
                onClick={() => setOpenPathname(null)}
              >
                Connexion
              </Link>
            )}

            <div className="mt-4 border-t border-[#2a2c30] pt-4 text-xs text-white">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                {session?.user ? "Connecté sur GLHF" : "Menu GLHF"}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-55 bg-black/50 min-[800px]:hidden"
          onClick={() => setOpenPathname(null)}
        />
      )}
    </nav>
  );
}
