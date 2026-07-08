"use client";

import { FormEvent, useState, useTransition } from "react";
import {
  CandidateFormValues,
  formValuesToPayload,
  validateCandidateFormValues,
} from "@/lib/candidate-record-form";
import { CandidateRecordUpsertPayload } from "@/lib/candidates";
import { CandidateRecordFields } from "@/components/candidates/CandidateRecordFields";

type CandidateRecordFormProps = {
  title: string;
  submitLabel: string;
  successMessage: string;
  initialValues: CandidateFormValues;
  resetOnSuccess?: boolean;
  onSubmitRecord: (payload: CandidateRecordUpsertPayload) => Promise<void>;
};

export function CandidateRecordForm({
  title,
  submitLabel,
  successMessage,
  initialValues,
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
        setError("No se pudo completar el envio. Intenta de nuevo.");
      }
    });
  }

  return (
    <section className="rounded-lg border border-zinc-200 p-4">
      <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
      <form className="mt-3" onSubmit={onSubmit}>
        <CandidateRecordFields values={values} disabled={isPending} onFieldChange={onFieldChange} />
        <button type="submit" className="mt-3 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50" disabled={isPending}>
          {submitLabel}
        </button>
      </form>
      {isPending ? <p className="mt-3 text-sm text-zinc-600">Guardando cambios...</p> : null}
      {success ? <p className="mt-3 text-sm text-emerald-700">{success}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}