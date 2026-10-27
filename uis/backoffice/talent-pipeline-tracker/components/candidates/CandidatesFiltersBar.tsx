import { Filter, Search } from "lucide-react";
import {
  CANDIDATE_STAGE_VALUES,
  CANDIDATE_STATUS_VALUES,
  STAGE_LABELS,
  STATUS_LABELS,
} from "@/lib/candidates";

type CandidatesFiltersBarProps = {
  status: string;
  stage: string;
  query: string;
  onStatusChange: (value: string) => void;
  onStageChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onClear: () => void;
};

export function CandidatesFiltersBar({
  status,
  stage,
  query,
  onStatusChange,
  onStageChange,
  onQueryChange,
  onClear,
}: CandidatesFiltersBarProps) {
  return (
    <section className="rounded-lg border border-[#c6c6cd] bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="grid flex-1 gap-3 md:grid-cols-3">
          <label className="text-xs font-medium text-[#1b1b1d]">
            Buscar
            <span className="relative mt-1 block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#45464d]" />
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Buscar por nombre o email"
                className="w-full rounded-lg border border-[#c6c6cd] bg-[#fcf8fa] py-2.5 pl-9 pr-3 text-sm text-[#1b1b1d]"
              />
            </span>
          </label>
          <label className="text-xs font-medium text-[#1b1b1d]">
            Estado
            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[#c6c6cd] bg-[#fcf8fa] px-3 py-2.5 text-sm text-[#1b1b1d]"
            >
              <option value="all">Todos</option>
              {CANDIDATE_STATUS_VALUES.map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-[#1b1b1d]">
            Etapa
            <select
              value={stage}
              onChange={(event) => onStageChange(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[#c6c6cd] bg-[#fcf8fa] px-3 py-2.5 text-sm text-[#1b1b1d]"
            >
              <option value="all">Todas</option>
              {CANDIDATE_STAGE_VALUES.map((value) => (
                <option key={value} value={value}>
                  {STAGE_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#e4e2e4] px-4 py-2.5 text-sm font-bold text-black hover:bg-[#dcd9db]"
        >
          <Filter className="h-4 w-4" />
          Limpiar filtros
        </button>
      </div>
    </section>
  );
}
