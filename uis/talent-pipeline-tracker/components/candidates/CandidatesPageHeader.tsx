type CandidatesPageHeaderProps = {
  total: number;
  visible: number;
};

export function CandidatesPageHeader({ total, visible }: CandidatesPageHeaderProps) {
  return (
    <header className="flex items-end justify-between gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          TrackFlow People & Talent · Sede Zaragoza
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
          Pipeline de candidaturas
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Proceso de selección para Asistente de Dirección. Mostrando {visible} de{" "}
          {total} candidaturas.
        </p>
      </div>
    </header>
  );
}
