"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CandidateRecord,
  STAGE_LABELS,
  STATUS_LABELS,
  updateCandidateRecord,
} from "@/lib/candidates";
import { CandidateProcessSelect } from "@/components/candidates/CandidateProcessSelect";

type CandidateStatusStageControlsProps = {
  candidateId: string;
  status: CandidateRecord["status"];
  stage: CandidateRecord["stage"];
};

export function CandidateStatusStageControls({
  candidateId,
  status,
  stage,
}: CandidateStatusStageControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusValue, setStatusValue] = useState(status);
  const [stageValue, setStageValue] = useState(stage);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: "status" | "stage", value: string) {
    setError(null);
    startTransition(async () => {
      try {
        if (field === "status") {
          await updateCandidateRecord(candidateId, { status: value as CandidateRecord["status"] });
          setStatusValue(value as CandidateRecord["status"]);
        } else {
          await updateCandidateRecord(candidateId, { stage: value as CandidateRecord["stage"] });
          setStageValue(value as CandidateRecord["stage"]);
        }
        router.refresh();
      } catch {
        setError("No se pudo actualizar el campo. Intenta de nuevo.");
      }
    });
  }

  return (
    <section className="mt-6 rounded-lg border border-zinc-200 p-4">
      <h2 className="text-sm font-semibold text-zinc-900">Actualizar proceso</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <CandidateProcessSelect
          label="Estado"
          value={statusValue}
          options={Object.entries(STATUS_LABELS)}
          onChange={(value) => updateField("status", value)}
          disabled={isPending}
        />
        <CandidateProcessSelect
          label="Etapa"
          value={stageValue}
          options={Object.entries(STAGE_LABELS)}
          onChange={(value) => updateField("stage", value)}
          disabled={isPending}
        />
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
