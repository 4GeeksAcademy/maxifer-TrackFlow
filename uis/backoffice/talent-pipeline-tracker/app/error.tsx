"use client";

import Link from "next/link";

type ErrorProps = {
  error: Error;
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-2xl font-semibold text-red-800">
          No se pudo cargar el pipeline de candidaturas
        </h1>
        <p className="mt-2 text-sm text-red-700">
          El servicio no está disponible en este momento. Inténtalo de nuevo o vuelve al inicio.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            Volver al inicio
          </Link>
        </div>
        <p className="mt-4 text-xs text-red-600">
          {error instanceof Error && error.message ? "Detalle técnico interno registrado en logs." : "Detalle técnico interno registrado en logs."}
        </p>
      </section>
    </main>
  );
}
