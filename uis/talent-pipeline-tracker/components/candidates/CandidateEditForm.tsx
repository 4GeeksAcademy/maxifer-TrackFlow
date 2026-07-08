"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { candidateToFormValues } from "@/lib/candidate-record-form";
import {
  CandidateRecord,
  CandidateRecordUpsertPayload,
  replaceCandidateRecord,
} from "@/lib/candidates";
import { CandidateRecordForm } from "@/components/candidates/CandidateRecordForm";

type CandidateEditFormProps = {
  candidate: CandidateRecord;
};

export function CandidateEditForm({ candidate }: CandidateEditFormProps) {
  const router = useRouter();
  const initialValues = useMemo(() => candidateToFormValues(candidate), [candidate]);

  async function onSubmitRecord(payload: CandidateRecordUpsertPayload) {
    await replaceCandidateRecord(candidate.id, payload);
    router.refresh();
  }

  return (
    <CandidateRecordForm
      key={`${candidate.id}:${candidate.updated_at}`}
      title="Editar candidatura"
      submitLabel="Guardar cambios"
      successMessage="Candidatura actualizada correctamente."
      initialValues={initialValues}
      onSubmitRecord={onSubmitRecord}
    />
  );
}