"use client";

import { useState, type FormEvent } from "react";
import { queryRAG, type RAGQueryResult } from "@/lib/rag";

const examples = [
  "¿Cuál es la ventana estándar de devolución?",
  "¿Qué transportista cubre mejor Aragón rural?",
  "¿Cuánto cuesta almacenar en Zaragoza?",
];

const sourceNames: Record<string, string> = {
  "sla-delivery": "SLA de Entrega",
  "returns-policy": "Política de Devoluciones",
  "carrier-coverage": "Cobertura de Transportistas",
  "storage-pricing": "Tarifas de Almacenamiento",
};

export default function AssistantPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<RAGQueryResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedQuestion = question.trim();
    if (!submittedQuestion || loading) return;

    setLoading(true);
    setError("");
    setResult(null);
    try {
      setResult(await queryRAG(submittedQuestion));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo completar la consulta.");
    } finally {
      setLoading(false);
    }
  }

  function chooseExample(value: string) {
    setQuestion(value);
    setError("");
  }

  return <main className="container">
    <header className="pageHeader">
      <span className="eyebrow">Comercial / Conocimiento</span>
      <div className="pageHeaderTitleRow"><h1>Asistente comercial</h1></div>
      <p>TrackFlow · Consultas de servicio para marcas</p>
    </header>

    <section className="card mx-auto w-full max-w-4xl" aria-labelledby="rag-query-heading">
      <h2 id="rag-query-heading">Consulta</h2>
      <form className="grid gap-3" onSubmit={submit}>
        <label className="form-field">
          Pregunta
          <textarea
            className="min-h-32 resize-y rounded-lg border border-line bg-surface px-3 py-3 text-sm font-normal text-ink"
            value={question}
            onChange={event => setQuestion(event.target.value)}
            maxLength={2000}
            placeholder="Escribe una pregunta sobre los servicios de TrackFlow"
            required
          />
        </label>
        <div className="flex flex-wrap gap-2" aria-label="Consultas frecuentes">
          {examples.map(example => <button
            key={example}
            type="button"
            className="min-h-9 rounded-lg border border-line bg-surface-soft px-3 py-1.5 text-left text-xs font-semibold text-ink hover:bg-accent-soft"
            onClick={() => chooseExample(example)}
          >{example}</button>)}
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={loading || !question.trim()}>
            {loading ? "Consultando..." : "Consultar"}
          </button>
        </div>
      </form>

      {error && <p role="alert" className="error mt-4">{error}</p>}
      {result && <section className="mt-6 border-t border-line pt-5" aria-labelledby="rag-answer-heading" aria-live="polite">
        <h2 id="rag-answer-heading" className="mb-3 text-lg font-semibold">Respuesta</h2>
        <p className="whitespace-pre-wrap text-sm leading-7 text-ink">{result.answer}</p>
        {result.sources.length > 0 && <ul className="mt-5 grid gap-2 border-t border-line pt-4 text-xs text-muted sm:grid-cols-2">
          {result.sources.map(source => <li key={`${source.source_document}:${source.section}`}>
            <span className="font-semibold text-ink">Fuente</span>
            <span className="mx-1">·</span>
            {sourceNames[source.source_document] ?? source.source_document}
            <span className="mx-1">/</span>
            {source.section}
          </li>)}
        </ul>}
      </section>}
    </section>
  </main>;
}