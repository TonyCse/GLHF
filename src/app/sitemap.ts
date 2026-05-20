import type { MetadataRoute } from "next";
import { getTournamentList } from "@/lib/tournaments";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/tournois`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/abonnements`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/classement`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/mentions`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/conditions`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    {
      url: `${baseUrl}/politique-confidentialite`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/donnees-personnelles`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    { url: `${baseUrl}/plan-du-site`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const tournois = await getTournamentList();
    const tournamentRoutes: MetadataRoute.Sitemap = tournois.map((t) => ({
      url: `${baseUrl}/tournois/${t.id}`,
      lastModified: new Date(t.date ?? t.createdAt ?? now),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
    return [...staticRoutes, ...tournamentRoutes];
  } catch {
    return staticRoutes;
  }
}
