import { CandidateNote, CandidateRecord } from "@/lib/candidates";
import { CandidateDetailsHeader } from "@/components/candidates/CandidateDetailsHeader";
import { CandidateMainDetailsGrid } from "@/components/candidates/CandidateMainDetailsGrid";
import { CandidateSecondaryDetails } from "@/components/candidates/CandidateSecondaryDetails";
import { CandidateEditForm } from "@/components/candidates/CandidateEditForm";
import { CandidateStatusStageControls } from "@/components/candidates/CandidateStatusStageControls";
import { CandidateNotesSection } from "@/components/candidates/CandidateNotesSection";

type CandidateDetailsCardProps = {
  candidate: CandidateRecord;
  notes: CandidateNote[];
};

export function CandidateDetailsCard({ candidate, notes }: CandidateDetailsCardProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <CandidateDetailsHeader fullName={candidate.full_name} position={candidate.position} />
      <CandidateMainDetailsGrid candidate={candidate} />
      <CandidateSecondaryDetails candidate={candidate} />
      <div className="mt-6">
        <CandidateEditForm candidate={candidate} />
      </div>
      <CandidateStatusStageControls
        candidateId={candidate.id}
        status={candidate.status}
        stage={candidate.stage}
      />
      <CandidateNotesSection candidateId={candidate.id} notes={notes} />
    </section>
  );
}