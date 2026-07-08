"use client";

import { useState } from "react";
import { CandidateDetailsHeader } from "@/components/candidates/CandidateDetailsHeader";
import { CandidateMainDetailsGrid } from "@/components/candidates/CandidateMainDetailsGrid";
import { CandidateSecondaryDetails } from "@/components/candidates/CandidateSecondaryDetails";
import { CandidateEditForm } from "@/components/candidates/CandidateEditForm";
import { CandidateStatusStageControls } from "@/components/candidates/CandidateStatusStageControls";
import { CandidateNotesSection } from "@/components/candidates/CandidateNotesSection";
import type { CandidateNote, CandidateRecord } from "@/types/candidates";

type CandidateDetailsCardProps = {
  candidate: CandidateRecord;
  notes: CandidateNote[];
};

export function CandidateDetailsCard({ candidate, notes }: CandidateDetailsCardProps) {
  const [candidateState, setCandidateState] = useState(candidate);

  function handleNotesCountChange(count: number) {
    setCandidateState((current) => ({ ...current, notes_count: count }));
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <CandidateDetailsHeader fullName={candidateState.full_name} position={candidateState.position} />
      <CandidateMainDetailsGrid candidate={candidateState} />
      <CandidateSecondaryDetails candidate={candidateState} />
      <div className="mt-6">
        <CandidateEditForm candidate={candidateState} onUpdated={setCandidateState} />
      </div>
      <CandidateStatusStageControls
        candidateId={candidateState.id}
        status={candidateState.status}
        stage={candidateState.stage}
        onUpdated={setCandidateState}
      />
      <CandidateNotesSection
        candidateId={candidateState.id}
        notes={notes}
        onNotesCountChange={handleNotesCountChange}
      />
    </section>
  );
}
