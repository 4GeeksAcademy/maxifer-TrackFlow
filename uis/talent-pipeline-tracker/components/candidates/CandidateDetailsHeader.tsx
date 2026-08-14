type CandidateDetailsHeaderProps = {
  fullName: string;
  position: string;
};

export function CandidateDetailsHeader({ fullName, position }: CandidateDetailsHeaderProps) {
  return (
    <header className="mb-8 border-b border-zinc-100 pb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{fullName}</h1>
      <p className="mt-2 text-sm text-zinc-600">{position}</p>
    </header>
  );
}