import PageLoader from "@/components/PageLoader";

export default function Loading() {
  return (
    <PageLoader
      label="Chargement"
      words={["dashboard", "stats", "utilisateurs", "tournois", "dashboard"]}
    />
  );
}
