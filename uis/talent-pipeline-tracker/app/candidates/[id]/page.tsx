import { notFound } from "next/navigation";
import { BackToCandidatesLink } from "@/components/candidates/BackToCandidatesLink";
import { CandidateDetailsCard } from "@/components/candidates/CandidateDetailsCard";
import { fetchCandidateById, fetchCandidateNotes } from "@/lib/candidates";

type CandidateDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
};

export default async function CandidateDetailsPage({ params, searchParams }: CandidateDetailsPageProps) {
  const { id } = await params;
  const { edit } = await searchParams;
  const [candidate, notes] = await Promise.all([fetchCandidateById(id), fetchCandidateNotes(id)]);

  if (!candidate) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col px-4 py-5 sm:px-5 lg:px-6">
      <BackToCandidatesLink />
      <CandidateDetailsCard candidate={candidate} notes={notes} initialEditMode={edit === "1"} />
    </main>
  );
}
