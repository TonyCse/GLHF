import { FaDiscord } from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#1c1d1f] text-white relative flex flex-col items-center px-4 py-10">
      <div className="text-6xl sm:text-8xl font-extrabold text-[#8F60D0] opacity-10 absolute top-1/2 transform -translate-y-1/2">
        GLHF
      </div>

      <div className="relative z-10 w-full max-w-7xl flex flex-col sm:flex-col items-center gap-6 text-center">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/" className="hover:text-[#8F60D0] transition">
            Accueil
          </Link>
          <Link href="/mentions" className="hover:text-[#8F60D0] transition">
            Mentions légales
          </Link>
          <Link href="/conditions" className="hover:text-[#8F60D0] transition">
            Conditions d&apos;utilisation
          </Link>
          <Link href="/politique-confidentialite" className="hover:text-[#8F60D0] transition">
            Politique de confidentialité
          </Link>
          <Link href="/donnees-personnelles" className="hover:text-[#8F60D0] transition">
            Données personnelles
          </Link>
          <Link href="/plan-du-site" className="hover:text-[#8F60D0] transition">
            Plan du site
          </Link>
          <Link href="/contact" className="hover:text-[#8F60D0] transition">
            Contact
          </Link>
        </nav>

        <div className="flex justify-center space-x-4">
          <a
            href="https://discord.gg/5PXM6R7bmG"
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

        <p className="text-sm text-white text-center">
          &copy; {new Date().getFullYear()} GLHF. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
