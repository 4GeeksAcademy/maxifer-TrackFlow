import { CandidatesListSection } from "@/components/candidates/CandidatesListSection";
import { fetchAllCandidates } from "@/lib/candidates";

export default async function Home() {
  const candidates = await fetchAllCandidates();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-4 py-5 sm:px-5 lg:px-6">
      <CandidatesListSection candidates={candidates} />
    </main>
  );
}
