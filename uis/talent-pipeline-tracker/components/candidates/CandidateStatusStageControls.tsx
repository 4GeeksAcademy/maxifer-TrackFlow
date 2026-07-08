"use client";

import { useState, useTransition } from "react";
import {
  STAGE_LABELS,
  STATUS_LABELS,
  updateCandidateRecord,
} from "@/lib/candidates";
import { CandidateProcessSelect } from "@/components/candidates/CandidateProcessSelect";
import type { CandidateRecord } from "@/types/candidates";

type CandidateStatusStageControlsProps = {
  candidateId: string;
  status: CandidateRecord["status"];
  stage: CandidateRecord["stage"];
  onUpdated?: (candidate: CandidateRecord) => void;
};

export function CandidateStatusStageControls({
  candidateId,
  status,
  stage,
  onUpdated,
}: CandidateStatusStageControlsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function updateField(field: "status" | "stage", value: string) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const payload =
          field === "status"
            ? { status: value as CandidateRecord["status"] }
            : { stage: value as CandidateRecord["stage"] };
        const updatedCandidate = await updateCandidateRecord(candidateId, payload);

        onUpdated?.(updatedCandidate);
        setSuccess("Campo actualizado correctamente.");
      } catch {
        setError("No se pudo actualizar el campo. Intenta de nuevo.");
      }
    });
  }

  return (
    <section className="mt-6 rounded-lg border border-zinc-200 p-4">
      <h2 className="text-sm font-semibold text-zinc-900">
        Actualizar proceso de selección
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <CandidateProcessSelect
          label="Estado"
          value={status}
          options={Object.entries(STATUS_LABELS)}
          onChange={(value) => updateField("status", value)}
          disabled={isPending}
        />
        <CandidateProcessSelect
          label="Etapa"
          value={stage}
          options={Object.entries(STAGE_LABELS)}
          onChange={(value) => updateField("stage", value)}
          disabled={isPending}
        />
      </div>
      {isPending ? <p className="mt-3 text-sm text-zinc-600">Actualizando...</p> : null}
      {success ? <p className="mt-3 text-sm text-emerald-700">{success}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
