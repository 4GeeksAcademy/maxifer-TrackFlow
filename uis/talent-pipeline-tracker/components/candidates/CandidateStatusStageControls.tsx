"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { CandidateProcessModal } from "@/components/candidates/CandidateProcessModal";
import type { CandidateRecord } from "@/types/candidates";

type CandidateStatusStageControlsProps = {
  candidateId: string;
  status: CandidateRecord["status"];
  stage: CandidateRecord["stage"];
  onUpdated?: (candidate: CandidateRecord) => void;
  hideTrigger?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function CandidateStatusStageControls({
  candidateId,
  status,
  stage,
  onUpdated,
  hideTrigger,
  isOpen,
  onOpenChange,
}: CandidateStatusStageControlsProps) {
  const [internalIsModalOpen, setInternalIsModalOpen] = useState(false);
  const isModalOpen = isOpen ?? internalIsModalOpen;

  function setModalOpen(nextIsOpen: boolean) {
    onOpenChange?.(nextIsOpen);
    if (isOpen === undefined) {
      setInternalIsModalOpen(nextIsOpen);
    }
  }

  return (
    <>
      {hideTrigger ? null : (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#c6c6cd] bg-white px-3 text-sm font-bold text-black hover:bg-[#eee9ec]"
          aria-label="Actualizar proceso"
          title="Actualizar proceso"
        >
          <RefreshCw className="pointer-events-none h-4 w-4" />
          Proceso
        </button>
      )}

      <CandidateProcessModal
        candidateId={candidateId}
        status={status}
        stage={stage}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onUpdated={onUpdated}
      />
    </>
  );
}
