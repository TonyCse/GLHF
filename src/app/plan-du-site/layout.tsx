import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plan du site | GLHF",
  description: "Retrouvez toutes les pages de GLHF.",
};

export default function PlanDuSiteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
