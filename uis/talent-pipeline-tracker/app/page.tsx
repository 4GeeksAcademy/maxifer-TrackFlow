import { CandidatesListSection } from "@/components/candidates/CandidatesListSection";
import { fetchAllCandidates } from "@/lib/candidates";

export default async function Home() {
  const candidates = await fetchAllCandidates();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
      <CandidatesListSection candidates={candidates} />
    </main>
  );
}
