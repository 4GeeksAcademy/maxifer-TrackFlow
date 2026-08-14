"use client";

import { FormEvent, useState, useTransition } from "react";
import {
  CandidateFormValues,
  formValuesToPayload,
  validateCandidateFormValues,
} from "@/lib/candidate-record-form";
import { CandidateRecordFields } from "@/components/candidates/CandidateRecordFields";
import type { CandidateRecordUpsertPayload } from "@/types/candidates";

type CandidateRecordFormProps = {
  title?: string;
  submitLabel: string;
  successMessage: string;
  initialValues: CandidateFormValues;
  showProcessFields?: boolean;
  resetOnSuccess?: boolean;
  onSubmitRecord: (payload: CandidateRecordUpsertPayload) => Promise<void>;
};

export function CandidateRecordForm({
  title,
  submitLabel,
  successMessage,
  initialValues,
  showProcessFields,
  resetOnSuccess,
  onSubmitRecord,
}: CandidateRecordFormProps) {
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function onFieldChange<T extends keyof CandidateFormValues>(field: T, value: CandidateFormValues[T]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateCandidateFormValues(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(async () => {
      try {
        await onSubmitRecord(formValuesToPayload(values));
        if (resetOnSuccess) setValues(initialValues);
        setSuccess(successMessage);
      } catch {
        setError("No se pudo completar el envío. Intenta de nuevo.");
      }
    });
  }

  return (
    <section>
      {title ? <h3 className="mb-4 text-base font-bold text-black">{title}</h3> : null}
      <form onSubmit={onSubmit}>
        <CandidateRecordFields
          values={values}
          disabled={isPending}
          showProcessFields={showProcessFields}
          onFieldChange={onFieldChange}
        />
        <div className="mt-4 flex justify-end border-t border-[#c6c6cd] pt-4">
          <button
            type="submit"
            className="rounded-lg bg-[#0058be] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#004395] disabled:opacity-50"
            disabled={isPending}
          >
            {isPending ? "Guardando..." : submitLabel}
          </button>
        </div>
      </form>
      {success ? <p className="mt-3 text-sm font-medium text-emerald-700">{success}</p> : null}
      {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
    </section>
  );
}
