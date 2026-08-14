"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Edit3, MoreHorizontal, RefreshCw } from "lucide-react";
import { CandidateStatusStageControls } from "@/components/candidates/CandidateStatusStageControls";
import { CandidateAvatar, StageBadge, StatusBadge } from "@/components/candidates/CandidateUi";
import type { CandidateRecord } from "@/types/candidates";

type CandidateTableRowProps = {
  candidate: CandidateRecord;
  onUpdated?: (candidate: CandidateRecord) => void;
};

export function CandidateTableRow({ candidate, onUpdated }: CandidateTableRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const actionButtonRef = useRef<HTMLButtonElement | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (!isMenuOpen) return;

    function updateMenuPosition() {
      const rect = actionButtonRef.current?.getBoundingClientRect();
      if (!rect) return;

      setMenuPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !actionButtonRef.current?.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }

    updateMenuPosition();
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isMenuOpen]);

  return (
    <tr className="group transition-colors hover:bg-[#f6f3f5]">
      <td className="px-5 py-3">
        <Link href={`/candidates/${candidate.id}`} className="flex items-center gap-3">
          <CandidateAvatar name={candidate.full_name} status={candidate.status} />
          <span>
            <span className="block text-sm font-semibold text-black group-hover:text-[#0058be]">
              {candidate.full_name}
            </span>
            <span className="text-xs text-[#45464d]">{candidate.email}</span>
          </span>
        </Link>
      </td>
      <td className="px-5 py-3 text-sm text-[#1b1b1d]">{candidate.position}</td>
      <td className="px-5 py-3">
        <StatusBadge status={candidate.status} />
      </td>
      <td className="px-5 py-3">
        <StageBadge stage={candidate.stage} />
      </td>
      <td className="px-5 py-3 text-right">
        <div className="relative inline-flex justify-end">
          <button
            ref={actionButtonRef}
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex rounded-lg p-2 text-[#45464d] hover:bg-[#e4e2e4] hover:text-[#0058be]"
            aria-label={`Abrir acciones de ${candidate.full_name}`}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {isMenuOpen ? (
            <div
              ref={menuRef}
              className="fixed z-50 w-48 overflow-hidden rounded-lg border border-[#c6c6cd] bg-white py-1 text-left shadow-lg"
              style={{ top: menuPosition.top, right: menuPosition.right }}
              role="menu"
            >
              <Link
                href={`/candidates/${candidate.id}?edit=1`}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-black hover:bg-[#f6f3f5]"
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
              >
                <Edit3 className="h-4 w-4 text-[#45464d]" />
                Editar
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsProcessModalOpen(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-black hover:bg-[#f6f3f5]"
                role="menuitem"
              >
                <RefreshCw className="h-4 w-4 text-[#45464d]" />
                Actualizar proceso
              </button>
            </div>
          ) : null}
        </div>
        <CandidateStatusStageControls
          candidateId={candidate.id}
          status={candidate.status}
          stage={candidate.stage}
          onUpdated={onUpdated}
          hideTrigger
          isOpen={isProcessModalOpen}
          onOpenChange={setIsProcessModalOpen}
        />
      </td>
    </tr>
  );
}
