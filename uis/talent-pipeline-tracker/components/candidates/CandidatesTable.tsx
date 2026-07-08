import { CandidateTableRow } from "@/components/candidates/CandidateTableRow";
import type { CandidateRecord } from "@/types/candidates";

type CandidatesTableProps = {
  candidates: CandidateRecord[];
};

export function CandidatesTable({ candidates }: CandidatesTableProps) {
  const hasCandidates = candidates.length > 0;

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-600">Nombre</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600">Puesto</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600">Estado</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600">Etapa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {hasCandidates ? (
              candidates.map((candidate) => <CandidateTableRow key={candidate.id} candidate={candidate} />)
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-zinc-500">
                  No hay candidaturas para los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
