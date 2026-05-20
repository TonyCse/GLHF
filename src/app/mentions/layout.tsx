import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales | GLHF",
  description: "Consultez les mentions légales du site GLHF.",
};

export default function MentionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
