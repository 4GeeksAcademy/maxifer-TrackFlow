export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Pipeline de candidaturas
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Cargando candidaturas de TrackFlow People & Talent...
        </p>
      </section>
    </main>
  );
}
