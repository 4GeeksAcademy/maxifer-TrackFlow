"use client";

import { useMemo } from "react";
import { candidateToFormValues } from "@/lib/candidate-record-form";
import { replaceCandidateRecord } from "@/lib/candidates";
import { CandidateRecordForm } from "@/components/candidates/CandidateRecordForm";
import type {
  CandidateRecord,
  CandidateRecordUpsertPayload,
} from "@/types/candidates";

type CandidateEditFormProps = {
  candidate: CandidateRecord;
  onUpdated?: (candidate: CandidateRecord) => void;
};

export function CandidateEditForm({ candidate, onUpdated }: CandidateEditFormProps) {
  const initialValues = useMemo(() => candidateToFormValues(candidate), [candidate]);

  async function onSubmitRecord(payload: CandidateRecordUpsertPayload) {
    const updatedCandidate = await replaceCandidateRecord(candidate.id, payload);
    onUpdated?.(updatedCandidate);
  }

  return (
    <CandidateRecordForm
      key={`${candidate.id}:${candidate.updated_at}`}
      submitLabel="Guardar cambios"
      successMessage="Candidatura actualizada correctamente."
      initialValues={initialValues}
      onSubmitRecord={onSubmitRecord}
    />
  );
}
