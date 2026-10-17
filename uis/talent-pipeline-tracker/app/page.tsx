import { CandidatesListSection } from "@/components/candidates/CandidatesListSection";
import { fetchAllCandidates } from "@/lib/candidates";

export default async function Home() {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 sm:px-5 lg:px-6">
        <h1 className="text-2xl font-semibold">Pipeline de candidaturas</h1>
        <p role="status">El servicio de candidaturas todavía no está configurado. Contacta con el administrador para habilitarlo.</p>
      </main>
    );
  }

  const candidates = await fetchAllCandidates();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-4 py-5 sm:px-5 lg:px-6">
      <CandidatesListSection candidates={candidates} />
    </main>
  );
}
