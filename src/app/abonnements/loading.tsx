import PageLoader from "@/components/PageLoader";

export default function Loading() {
  return (
    <PageLoader
      label="Chargement"
      words={["forfaits", "tokens", "paiements", "options", "forfaits"]}
    />
  );
}
