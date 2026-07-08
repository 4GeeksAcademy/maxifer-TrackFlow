type CandidatesPageHeaderProps = {
  total: number;
  visible: number;
};

export function CandidatesPageHeader({ total, visible }: CandidatesPageHeaderProps) {
  return (
    <header className="flex items-end justify-between gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Candidaturas</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Mostrando {visible} de {total} candidaturas
        </p>
      </div>
    </header>
  );
}