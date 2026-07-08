import { CandidateRecord } from "@/lib/candidates";
import { CandidateDetailsHeader } from "@/components/candidates/CandidateDetailsHeader";
import { CandidateMainDetailsGrid } from "@/components/candidates/CandidateMainDetailsGrid";
import { CandidateSecondaryDetails } from "@/components/candidates/CandidateSecondaryDetails";

type CandidateDetailsCardProps = {
  candidate: CandidateRecord;
};

export function CandidateDetailsCard({ candidate }: CandidateDetailsCardProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <CandidateDetailsHeader fullName={candidate.full_name} position={candidate.position} />
      <CandidateMainDetailsGrid candidate={candidate} />
      <CandidateSecondaryDetails candidate={candidate} />
    </section>
  );
}