import PageLoader from "@/components/PageLoader";

export default function Loading() {
  return (
    <PageLoader
      label="Chargement"
      words={["classement", "joueurs", "points", "saisons", "classement"]}
    />
  );
}
