"use client";

import {
  EMPTY_CANDIDATE_FORM,
  CandidateFormValues,
} from "@/lib/candidate-record-form";
import { createCandidateRecord } from "@/lib/candidates";
import { CandidateRecordForm } from "@/components/candidates/CandidateRecordForm";
import type {
  CandidateRecord,
  CandidateRecordUpsertPayload,
} from "@/types/candidates";

const EMPTY_CREATE_FORM: CandidateFormValues = { ...EMPTY_CANDIDATE_FORM };

type CandidateCreateFormProps = {
  onCreated?: (candidate: CandidateRecord) => void;
};

export function CandidateCreateForm({ onCreated }: CandidateCreateFormProps) {
  async function onSubmitRecord(payload: CandidateRecordUpsertPayload) {
    const createdCandidate = await createCandidateRecord(payload);
    onCreated?.(createdCandidate);
  }

  return (
    <CandidateRecordForm
      submitLabel="Crear candidatura"
      successMessage="Candidatura creada correctamente."
      initialValues={EMPTY_CREATE_FORM}
      showProcessFields={false}
      resetOnSuccess
      onSubmitRecord={onSubmitRecord}
    />
  );
}
