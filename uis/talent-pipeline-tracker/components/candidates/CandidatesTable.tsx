import { CandidateTableRow } from "@/components/candidates/CandidateTableRow";
import type { CandidateRecord } from "@/types/candidates";

type CandidatesTableProps = {
  candidates: CandidateRecord[];
  onCandidateUpdated?: (candidate: CandidateRecord) => void;
};

export function CandidatesTable({ candidates, onCandidateUpdated }: CandidatesTableProps) {
  const hasCandidates = candidates.length > 0;

  return (
    <section className="overflow-hidden rounded-lg border border-[#c6c6cd] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="border-b border-[#c6c6cd] bg-[#f6f3f5]">
            <tr>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#1b1b1d]">Nombre</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#1b1b1d]">Puesto</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#1b1b1d]">Estado</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#1b1b1d]">Etapa</th>
              <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-[0.12em] text-[#1b1b1d]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c6c6cd] bg-white">
            {hasCandidates ? (
              candidates.map((candidate) => (
                <CandidateTableRow
                  key={candidate.id}
                  candidate={candidate}
                  onUpdated={onCandidateUpdated}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-[#45464d]">
                  No hay candidaturas para los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-[#c6c6cd] bg-[#fcf8fa] px-5 py-3 text-sm text-[#45464d] sm:flex-row sm:items-center sm:justify-between">
        <span>Mostrando {candidates.length} candidaturas</span>
        <div className="flex gap-2">
          <button className="rounded-md border border-[#c6c6cd] px-3 py-1.5 text-[#45464d] opacity-40" disabled>
            1
          </button>
        </div>
      </div>
    </section>
  );
}
