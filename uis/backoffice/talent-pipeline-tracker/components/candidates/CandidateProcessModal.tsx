"use client";

import { useState, useTransition } from "react";
import {
  STAGE_LABELS,
  STATUS_LABELS,
  updateCandidateRecord,
} from "@/lib/candidates";
import { CandidateProcessSelect } from "@/components/candidates/CandidateProcessSelect";
import { Modal } from "@/components/ui/Modal";
import type { CandidateRecord } from "@/types/candidates";

type CandidateProcessModalProps = {
  candidateId: string;
  status: CandidateRecord["status"];
  stage: CandidateRecord["stage"];
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (candidate: CandidateRecord) => void;
};

export function CandidateProcessModal({
  candidateId,
  status,
  stage,
  isOpen,
  onClose,
  onUpdated,
}: CandidateProcessModalProps) {
  if (!isOpen) return null;

  return (
    <CandidateProcessModalContent
      key={`${candidateId}-${status}-${stage}`}
      candidateId={candidateId}
      status={status}
      stage={stage}
      isOpen={isOpen}
      onClose={onClose}
      onUpdated={onUpdated}
    />
  );
}

function CandidateProcessModalContent({
  candidateId,
  status,
  stage,
  isOpen,
  onClose,
  onUpdated,
}: CandidateProcessModalProps) {
  const [isPending, startTransition] = useTransition();
  const [draftStatus, setDraftStatus] = useState(status);
  const [draftStage, setDraftStage] = useState(stage);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleClose() {
    if (isPending) return;
    onClose();
  }

  function updateProcess() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const updatedCandidate = await updateCandidateRecord(candidateId, {
          status: draftStatus,
          stage: draftStage,
        });

        onUpdated?.(updatedCandidate);
        setSuccess("Proceso actualizado correctamente.");
        setDraftStatus(updatedCandidate.status);
        setDraftStage(updatedCandidate.stage);
        onClose();
      } catch {
        setError("No se pudo actualizar el proceso. Intenta de nuevo.");
      }
    });
  }

  return (
    <Modal
      title="Actualizar proceso"
      description="Modifica el estado y la etapa de la candidatura."
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
    >
      <div className="space-y-3">
        <CandidateProcessSelect
          label="Estado"
          value={draftStatus}
          options={Object.entries(STATUS_LABELS)}
          onChange={(value) => setDraftStatus(value as CandidateRecord["status"])}
          disabled={isPending}
          compact
        />
        <CandidateProcessSelect
          label="Etapa"
          value={draftStage}
          options={Object.entries(STAGE_LABELS)}
          onChange={(value) => setDraftStage(value as CandidateRecord["stage"])}
          disabled={isPending}
          compact
        />
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-[#c6c6cd] bg-white px-3 py-2 text-xs font-bold text-black hover:bg-[#eee9ec] disabled:opacity-50"
            disabled={isPending}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={updateProcess}
            className="rounded-md bg-[#0058be] px-3 py-2 text-xs font-bold text-white hover:bg-[#004395] disabled:opacity-50"
            disabled={isPending}
          >
            {isPending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
      {success ? <p className="mt-3 text-sm font-medium text-emerald-700">{success}</p> : null}
      {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
    </Modal>
  );
}
