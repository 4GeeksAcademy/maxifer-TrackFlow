import { CandidateStage, CandidateStatus, STAGE_LABELS, STATUS_LABELS } from "@/lib/candidates";

const STATUS_VALUES = Object.keys(STATUS_LABELS) as CandidateStatus[];
const STAGE_VALUES = Object.keys(STAGE_LABELS) as CandidateStage[];

type CandidatesFiltersBarProps = {
  status: string;
  stage: string;
  query: string;
  onStatusChange: (value: string) => void;
  onStageChange: (value: string) => void;
  onQueryChange: (value: string) => void;
};

export function CandidatesFiltersBar({
  status,
  stage,
  query,
  onStatusChange,
  onStageChange,
  onQueryChange,
}: CandidatesFiltersBarProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-3">
      <label className="text-xs font-medium text-zinc-600">
        Estado
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-800"
        >
          <option value="all">Todos</option>
          {STATUS_VALUES.map((value) => (
            <option key={value} value={value}>{STATUS_LABELS[value]}</option>
          ))}
        </select>
      </label>
      <label className="text-xs font-medium text-zinc-600">
        Etapa
        <select
          value={stage}
          onChange={(event) => onStageChange(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-800"
        >
          <option value="all">Todas</option>
          {STAGE_VALUES.map((value) => (
            <option key={value} value={value}>{STAGE_LABELS[value]}</option>
          ))}
        </select>
      </label>
      <label className="text-xs font-medium text-zinc-600">
        Búsqueda
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Nombre o email"
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-800"
        />
      </label>
    </div>
  );
}