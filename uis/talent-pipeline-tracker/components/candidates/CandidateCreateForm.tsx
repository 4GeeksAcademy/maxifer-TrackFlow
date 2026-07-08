"use client";

import { useRouter } from "next/navigation";
import {
  EMPTY_CANDIDATE_FORM,
  CandidateFormValues,
} from "@/lib/candidate-record-form";
import { CandidateRecordUpsertPayload, createCandidateRecord } from "@/lib/candidates";
import { CandidateRecordForm } from "@/components/candidates/CandidateRecordForm";

const EMPTY_CREATE_FORM: CandidateFormValues = { ...EMPTY_CANDIDATE_FORM };

export function CandidateCreateForm() {
  const router = useRouter();

  async function onSubmitRecord(payload: CandidateRecordUpsertPayload) {
    await createCandidateRecord(payload);
    router.refresh();
  }

  return (
    <CandidateRecordForm
      title="Registrar candidatura"
      submitLabel="Crear candidatura"
      successMessage="Candidatura creada correctamente."
      initialValues={EMPTY_CREATE_FORM}
      resetOnSuccess
      onSubmitRecord={onSubmitRecord}
    />
  );
}