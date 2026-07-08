const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type CandidateStatus = "received" | "in_progress" | "selected" | "discarded";

export type CandidateStage =
  | "pending"
  | "review"
  | "personal_interview"
  | "technical_interview"
  | "offer_presented";

export type CandidateRecord = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string | null;
  cv_url: string;
  status: CandidateStatus;
  stage: CandidateStage;
  experience_years: number;
  notes_count: number;
  applied_at: string;
  updated_at: string;
};

type RecordsResponse = {
  total: number;
  page: number;
  limit: number;
  data: CandidateRecord[];
};

export const STATUS_LABELS: Record<CandidateStatus, string> = {
  received: "Recibida",
  in_progress: "En proceso",
  selected: "Seleccionada",
  discarded: "Descartada",
};

export const STAGE_LABELS: Record<CandidateStage, string> = {
  pending: "Pendiente de revisión",
  review: "En revisión",
  personal_interview: "Entrevista personal",
  technical_interview: "Entrevista técnica",
  offer_presented: "Oferta presentada",
};

function ensureApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error("Falta NEXT_PUBLIC_API_URL en el entorno.");
  }

  return API_BASE_URL;
}

async function fetchRecordsPage(page: number, limit: number): Promise<RecordsResponse> {
  const baseUrl = ensureApiBaseUrl();
  const url = new URL(`${baseUrl}/records`);

  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Error al obtener candidaturas (${response.status}).`);
  }

  return (await response.json()) as RecordsResponse;
}

export async function fetchAllCandidates(): Promise<CandidateRecord[]> {
  const firstPage = await fetchRecordsPage(1, 100);
  const totalPages = Math.max(1, Math.ceil(firstPage.total / firstPage.limit));

  if (totalPages === 1) {
    return firstPage.data;
  }

  const pendingPages: Promise<RecordsResponse>[] = [];

  for (let page = 2; page <= totalPages; page += 1) {
    pendingPages.push(fetchRecordsPage(page, firstPage.limit));
  }

  const remainingPages = await Promise.all(pendingPages);
  const allCandidates = [
    ...firstPage.data,
    ...remainingPages.flatMap((payload) => payload.data),
  ];

  // Avoid duplicated records if backend pagination behavior changes.
  const dedupedById = new Map(allCandidates.map((candidate) => [candidate.id, candidate]));

  return [...dedupedById.values()];
}

export async function fetchCandidateById(id: string): Promise<CandidateRecord | null> {
  const baseUrl = ensureApiBaseUrl();
  const response = await fetch(`${baseUrl}/records/${id}`, { cache: "no-store" });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Error al obtener la candidatura (${response.status}).`);
  }

  return (await response.json()) as CandidateRecord;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}