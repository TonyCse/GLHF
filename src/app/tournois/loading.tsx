import PageLoader from "@/components/PageLoader";

export default function Loading() {
  return (
    <PageLoader
      label="Chargement"
      words={["tournois", "equipes", "brackets", "planning", "tournois"]}
    />
  );
}
