import { ChevronLeft, ChevronRight } from "lucide-react";
import { CandidateTableRow } from "@/components/candidates/CandidateTableRow";
import type { CandidateRecord } from "@/types/candidates";

type CandidatesTableProps = {
  candidates: CandidateRecord[];
  currentPage: number;
  pageSize: number;
  totalCandidates: number;
  totalPages: number;
  onCandidateUpdated?: (candidate: CandidateRecord) => void;
  onPageChange: (page: number) => void;
};

type PaginationItem = number | "ellipsis-start" | "ellipsis-end";

function getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const items: PaginationItem[] = [1];
  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  if (startPage > 2) items.push("ellipsis-start");

  for (let page = startPage; page <= endPage; page += 1) {
    items.push(page);
  }

  if (endPage < totalPages - 1) items.push("ellipsis-end");

  items.push(totalPages);
  return items;
}

export function CandidatesTable({
  candidates,
  currentPage,
  pageSize,
  totalCandidates,
  totalPages,
  onCandidateUpdated,
  onPageChange,
}: CandidatesTableProps) {
  const hasCandidates = candidates.length > 0;
  const firstVisibleCandidate = totalCandidates === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastVisibleCandidate = Math.min(currentPage * pageSize, totalCandidates);
  const paginationItems = getPaginationItems(currentPage, totalPages);

  function goToPage(page: number) {
    onPageChange(Math.min(Math.max(page, 1), totalPages));
  }

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
        <span>
          Mostrando {firstVisibleCandidate}-{lastVisibleCandidate} de {totalCandidates} candidaturas
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Ir a la página anterior"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#c6c6cd] text-[#45464d] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {paginationItems.map((page) => {
            if (typeof page !== "number") {
              return (
                <span
                  key={page}
                  className="inline-flex h-8 min-w-8 items-center justify-center px-2 text-[#45464d]"
                >
                  ...
                </span>
              );
            }

            const isCurrentPage = page === currentPage;

            return (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                aria-current={isCurrentPage ? "page" : undefined}
                className={`h-8 min-w-8 rounded-md border px-3 text-sm font-bold ${
                  isCurrentPage
                    ? "border-[#1b1b1d] bg-[#1b1b1d] text-white"
                    : "border-[#c6c6cd] text-[#45464d] hover:bg-[#e4e2e4]"
                }`}
              >
                {page}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Ir a la página siguiente"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#c6c6cd] text-[#45464d] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
