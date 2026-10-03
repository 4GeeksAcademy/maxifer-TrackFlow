import { apiFetch } from "@/lib/auth";

export const categories = ["lost_parcel", "delivery_failure", "inventory_discrepancy", "carrier_issue", "returns_issue", "warehouse_incident", "system_failure", "client_complaint", "other"] as const;
export const statuses = ["open", "in_progress", "resolved", "discarded"] as const;
export const origins = ["customer", "branch", "internal"] as const;
export const branches = ["central", "la_warehouse", "la_office", "zaragoza_warehouse", "zaragoza_office"] as const;
export const branchLabels: Record<string, string> = { central: "Central", la_warehouse: "Los Ángeles - Almacén", la_office: "Los Ángeles - Oficina", zaragoza_warehouse: "Zaragoza - Almacén", zaragoza_office: "Zaragoza - Oficina" };
export const transitions: Record<string, string[]> = { open: ["in_progress", "discarded"], in_progress: ["resolved", "discarded"], resolved: [], discarded: [] };

export type Incident = { id: number; title: string; description: string; category: string; status: string; origin: string; branch: string; created_at: string; updated_at: string };
export type IncidentInput = Pick<Incident, "title" | "description" | "category" | "status" | "origin" | "branch">;
export type Summary = { total: number; by_status: Record<string, number>; by_category: Record<string, number>; by_origin: Record<string, number>; by_branch: Record<string, number> };
export class IncidentApiError extends Error { constructor(message: string, public field?: string) { super(message); } }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try { response = await apiFetch(`/backend/api/incidents${path}`, init); }
  catch { throw new IncidentApiError("No se pudo conectar con el servidor. Intentá nuevamente."); }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new IncidentApiError(data?.message || "No se pudo completar la operación.", data?.field);
  return data as T;
}
export function getIncidents(filters: Record<string, string>) {
  const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
  return request<Incident[]>(params.size ? `?${params}` : "");
}
export const getIncident = (id: number) => request<Incident>(`/${id}`);
export const createIncident = (payload: IncidentInput) => request<Incident>("", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
export const updateIncidentStatus = (id: number, status: string) => request<Incident>(`/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
export const getIncidentsSummary = () => request<Summary>("/summary");
