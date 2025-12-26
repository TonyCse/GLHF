"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Fermer le sidebar quand on navigue sur mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/users", label: "Utilisateurs", icon: "👥" },
    { href: "/admin/tournois", label: "Tournois", icon: "🏆" },
    { href: "/admin/paiements", label: "Paiements", icon: "💳" },
    { href: "/", label: "Accueil", icon: "🏠" },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/") return false;
    return pathname.startsWith(href) && href !== "/admin";
  };

  return (
    <div className="min-h-screen bg-[#232426] text-white flex relative">
      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-[#1c1d1f] p-5 
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          lg:block
        `}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="text-2xl font-extrabold text-[#8F60D0]">GLHF • Admin</div>
          {/* Bouton fermer pour mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
            aria-label="Fermer le menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="space-y-1 text-2xl">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors
                ${isActive(item.href)
                  ? "bg-[#8F60D0] text-white font-medium"
                  : "hover:bg-[#232426] text-gray-300 hover:text-white"
                }
              `}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Indicateur de statut en bas */}
        <div className="absolute bottom-5 left-5 right-5">
          <div className="text-xs text-gray-500 border-t border-[#2a2c30] pt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Connecté en tant qu&apos;admin
            </div>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 lg:ml-0">
        {/* Header mobile avec bouton hamburger */}
        <div className="lg:hidden bg-[#1c1d1f] p-4 border-b border-[#2a2c30]">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Ouvrir le menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="text-lg font-bold text-[#8F60D0]">GLHF Admin</div>
            <div className="w-6"></div> {/* Spacer pour centrer le titre */}
          </div>
        </div>

        {/* Contenu des pages */}
        <div className="p-4 lg:p-5">
          {children}
        </div>
      </main>
    </div>
  );
}



