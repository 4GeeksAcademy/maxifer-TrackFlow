import { notFound } from "next/navigation";
import { BackToCandidatesLink } from "@/components/candidates/BackToCandidatesLink";
import { CandidateDetailsCard } from "@/components/candidates/CandidateDetailsCard";
import { fetchCandidateById, fetchCandidateNotes } from "@/lib/candidates";

type CandidateDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CandidateDetailsPage({ params }: CandidateDetailsPageProps) {
  const { id } = await params;
  const [candidate, notes] = await Promise.all([fetchCandidateById(id), fetchCandidateNotes(id)]);

  if (!candidate) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
      <BackToCandidatesLink />
      <CandidateDetailsCard candidate={candidate} notes={notes} />
    </main>
  );
}