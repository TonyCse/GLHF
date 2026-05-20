import type { Metadata } from "next";
import { Rajdhani } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "aos/dist/aos.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

const rajdhani = Rajdhani({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const siteDescription =
  "GLHF est une plateforme de tournois gaming et esports qui complete Discord pour creer, rejoindre et organiser des competitions sur League of Legends, Valorant, Overwatch et plus.";

export const metadata: Metadata = {
  title: "GLHF | Plateforme de tournois gaming et esports en ligne",
  description: siteDescription,
  keywords: [
    "tournoi gaming",
    "plateforme esport",
    "organiser tournoi jeux video",
    "tournoi League of Legends",
    "tournoi Valorant",
    "tournoi Overwatch",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://www.gl-hf.site"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "GLHF | Plateforme de tournois gaming et esports en ligne",
    description: siteDescription,
    type: "website",
    locale: "fr_FR",
    url: "/",
    images: [
      {
        url: "/images/logo.webp",
        width: 1200,
        height: 630,
        alt: "GLHF - plateforme de tournois gaming",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GLHF | Plateforme de tournois gaming et esports en ligne",
    description: siteDescription,
    images: ["/images/logo.webp"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "";
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GLHF",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://www.gl-hf.site",
    description: "Plateforme de tournois e-sports en ligne",
  };

  return (
    <html lang="fr">
      <body className={`${rajdhani.className} text-white`}>
        <Script
          id="website-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {gtmId && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="gtm"
            />
          </noscript>
        )}
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black"
          >
            Aller au contenu
          </a>
          <main
            id="main-content"
            className="flex min-h-screen flex-col justify-between bg-[#232426]"
          >
            <Navbar />
            <div className="h-full flex-1 pt-23">{children}</div>
            <Footer />
          </main>
        </Providers>
      </body>
    </html>
  );
}
