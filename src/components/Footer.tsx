import { FaDiscord } from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#1c1d1f] text-gray-400 relative flex flex-col items-center px-4 py-10">
      
      {/* Grand Logo GLHF en arrière-plan */}
      <h1 className="text-6xl sm:text-8xl font-extrabold text-[#8F60D0] opacity-10 absolute top-1/2 transform -translate-y-1/2">
        GLHF
      </h1>

      {/* Contenu principal du footer */}
      <div className="relative z-10 w-full max-w-7xl flex flex-col sm:flex-col items-center gap-6 text-center">

        {/* Liens utiles */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/" className="hover:text-[#8F60D0] transition">Accueil</Link>
          <a href="/mentions" className="hover:text-[#8F60D0] transition">Mentions légales</a>
          <a href="/conditions" className="hover:text-[#8F60D0] transition">Conditions d&apos;utilisation</a>
          <Link href="/plan-du-site" className="hover:text-[#8F60D0] transition">Plan du site</Link>
          <a href="/contact" className="hover:text-[#8F60D0] transition">Contact</a>
        </nav>

        {/* Réseaux sociaux */}
        <div className="flex justify-center space-x-4">
          <a
            href="https://discord.gg/a3Qxf55B"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#8F60D0] transition"
            aria-label="Discord"
            title="Discord"
          >
            <FaDiscord size={30} className="text-[#8F60D0]" aria-hidden="true" />
            <span className="sr-only">Discord</span>
          </a>
        </div>

        {/* Copyright */}
        <p className="text-sm text-gray-400 text-center">
          &copy; {new Date().getFullYear()} GLHF. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
