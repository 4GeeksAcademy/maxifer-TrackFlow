export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col px-4 py-5 sm:px-5 lg:px-6">
      <section className="rounded-lg border border-[#c6c6cd] bg-white p-4 shadow-sm">
        <div className="h-5 w-56 animate-pulse rounded bg-[#e4e2e4]" />
        <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-[#f0edef]" />
      </section>
    </main>
  );
}
