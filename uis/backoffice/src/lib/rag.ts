import { apiFetch } from "@/lib/auth";

export type RAGSource = {
  source_document: string;
  section: string;
};

export type RAGQueryResult = {
  answer: string;
  sources: RAGSource[];
  retrieved_count: number;
  abstained: boolean;
};

export async function queryRAG(question: string): Promise<RAGQueryResult> {
  const response = await apiFetch("/backend/api/rag/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = payload?.detail;
    throw new Error(typeof detail === "string" ? detail : "No se pudo consultar la base de conocimiento.");
  }

  return payload as RAGQueryResult;
}