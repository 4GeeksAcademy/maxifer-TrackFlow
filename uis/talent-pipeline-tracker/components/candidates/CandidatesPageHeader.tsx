import { Clock3, MapPin, Plus, RefreshCw, UserCheck, Users } from "lucide-react";

type CandidatesPageHeaderProps = {
  total: number;
  visible: number;
  metrics: {
    total: number;
    pending: number;
    inProgress: number;
    selected: number;
  };
  onCreateClick: () => void;
};

const metricCards = [
  { key: "total", label: "Total", Icon: Users, iconClass: "bg-[#e4e2e4] text-black" },
  { key: "pending", label: "Pendientes", Icon: Clock3, iconClass: "bg-amber-50 text-amber-700" },
  { key: "inProgress", label: "En proceso", Icon: RefreshCw, iconClass: "bg-blue-50 text-blue-700" },
  { key: "selected", label: "Seleccionados", Icon: UserCheck, iconClass: "bg-emerald-50 text-emerald-700" },
] as const;

export function CandidatesPageHeader({
  total,
  visible,
  metrics,
  onCreateClick,
}: CandidatesPageHeaderProps) {
  return (
    <header className="space-y-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-black sm:text-3xl">
            Pipeline de candidaturas
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-1 text-sm text-[#45464d]">
            <MapPin className="h-4 w-4" />
            Asistente de Dirección - Sede Zaragoza
            <span>•</span>
            <span className="font-bold text-[#0058be]">
              {visible} de {total} candidaturas
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateClick}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0058be] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#004395] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Registrar candidatura
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ key, label, Icon, iconClass }) => (
          <div
            key={key}
            className="flex items-center gap-3 rounded-lg border border-[#c6c6cd] bg-white p-4 shadow-sm"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}>
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-xs font-bold uppercase tracking-[0.08em] text-[#45464d]">
                {label}
              </span>
              <span className="text-2xl font-black text-black">{metrics[key]}</span>
            </span>
          </div>
        ))}
      </div>
    </header>
  );
}
