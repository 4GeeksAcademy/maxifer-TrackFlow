"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { branches, branchLabels, categories, createIncident, getIncidents, getIncidentsSummary, IncidentApiError, origins, statuses, transitions, updateIncidentStatus } from "@/lib/incidents";
import type { Incident, IncidentInput, Summary } from "@/lib/incidents";

const initialForm: IncidentInput = { title: "", description: "", category: "carrier_issue", status: "open", origin: "internal", branch: "central" };
const fieldLabels: Record<string, string> = { title: "Título", description: "Descripción", category: "Categoría", status: "Estado", origin: "Origen", branch: "Sede" };
const label = (key: string) => branchLabels[key] || key.replaceAll("_", " ");

export default function IncidentsPage() {
  const [form, setForm] = useState<IncidentInput>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formMessage, setFormMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ status: "", origin: "", branch: "", category: "" });
  const [rows, setRows] = useState<Incident[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const listRequest = useRef(0);

  const loadList = useCallback(async () => {
    const requestId = ++listRequest.current;
    setListLoading(true); setListError("");
    try {
      const result = await getIncidents(filters);
      if (requestId === listRequest.current) setRows(result);
    } catch { if (requestId === listRequest.current) setListError("No pudimos cargar las incidencias."); }
    finally { if (requestId === listRequest.current) setListLoading(false); }
  }, [filters]);
  const loadSummary = useCallback(async () => {
    setSummaryLoading(true); setSummaryError("");
    try { setSummary(await getIncidentsSummary()); }
    catch { setSummaryError("No se pudo cargar el resumen."); }
    finally { setSummaryLoading(false); }
  }, []);
  useEffect(() => { const timer = setTimeout(() => void loadList(), 0); return () => clearTimeout(timer); }, [loadList]);
  useEffect(() => { const timer = setTimeout(() => void loadSummary(), 0); return () => clearTimeout(timer); }, [loadSummary]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors: Record<string, string> = {};
    for (const field of ["title", "description", "category", "status", "origin", "branch"] as const) {
      if (!form[field].trim()) errors[field] = `${fieldLabels[field]} es obligatorio`;
    }
    if (form.title.length > 120) errors.title = "El título no puede superar 120 caracteres";
    setFieldErrors(errors); setFormMessage("");
    if (Object.keys(errors).length) return;
    setSaving(true);
    try {
      await createIncident(form);
      setForm(initialForm); setFieldErrors({}); setFormMessage("Incidencia creada correctamente.");
      void loadList(); void loadSummary();
    } catch (error) {
      if (error instanceof IncidentApiError && error.field && error.field in form) setFieldErrors({ [error.field]: error.message });
      else setFormMessage(error instanceof Error ? error.message : "No se pudo crear la incidencia.");
    } finally { setSaving(false); }
  }

  async function changeStatus(row: Incident, next: string) {
    if (!next || pendingId !== null) return;
    setStatusError(""); setPendingId(row.id);
    setRows(current => current.map(item => item.id === row.id ? { ...item, status: next } : item));
    try {
      const saved = await updateIncidentStatus(row.id, next);
      setRows(current => current.map(item => item.id === row.id ? saved : item));
      void loadSummary();
    } catch {
      setRows(current => current.map(item => item.id === row.id ? row : item));
      setStatusError(`No se pudo actualizar «${row.title}». El estado anterior se restauró.`);
    } finally { setPendingId(null); }
  }

  return <main className="container">
    <header className="pageHeader"><span className="eyebrow">OPERACIONES</span><h1>Gestor de incidencias</h1><p>Registrá y seguí los casos de todas las sedes de TrackFlow.</p></header>
    <section className="card" id="new-incident"><h2>Nueva incidencia</h2>
      <form className="incidentForm" onSubmit={submit} noValidate>
        {(["title", "description"] as const).map(field => <label key={field} className={field === "description" ? "incidentWide" : ""}>{fieldLabels[field]}
          {field === "description" ? <textarea value={form[field]} onChange={event => setForm({ ...form, [field]: event.target.value })} aria-invalid={!!fieldErrors[field]} /> : <input value={form[field]} onChange={event => setForm({ ...form, [field]: event.target.value })} maxLength={121} aria-invalid={!!fieldErrors[field]} />}
          {fieldErrors[field] && <small className="fieldError">{fieldErrors[field]}</small>}
        </label>)}
        {(["category", "status", "origin", "branch"] as const).map(field => <label key={field} className={field === "branch" && form.origin === "branch" ? "branchRequired" : ""}>{fieldLabels[field]}
          <select value={form[field]} onChange={event => setForm({ ...form, [field]: event.target.value })} aria-invalid={!!fieldErrors[field]}>
            {(field === "category" ? categories : field === "status" ? statuses : field === "origin" ? origins : branches).map(value => <option key={value} value={value}>{label(value)}</option>)}
          </select>{fieldErrors[field] && <small className="fieldError">{fieldErrors[field]}</small>}
        </label>)}
        <div className="incidentWide"><button type="submit" disabled={saving}>{saving ? "Guardando..." : "Crear incidencia"}</button></div>
      </form>{formMessage && <p role="status" className={formMessage.includes("correctamente") ? "successMessage" : "error"}>{formMessage}</p>}
    </section>
    <section className="card"><h2>Resumen</h2>
      {summaryLoading ? <p>Cargando resumen...</p> : summaryError ? <p role="alert">{summaryError} <button onClick={() => void loadSummary()}>Reintentar</button></p> : summary && <><p className="summaryTotal">Total: <strong>{summary.total}</strong></p><div className="summaryGrid">{(["by_status", "by_category", "by_origin", "by_branch"] as const).map(group => <div key={group}><h3>{{ by_status: "Por estado", by_category: "Por categoría", by_origin: "Por origen", by_branch: "Por sede" }[group]}</h3>{Object.keys(summary[group]).length ? <ul className="dataList">{Object.entries(summary[group]).map(([key, count]) => <li key={key}><span>{label(key)}</span><strong>{count}</strong></li>)}</ul> : <p>Sin datos</p>}</div>)}</div></>}
    </section>
    <section className="card"><h2>Incidencias</h2><div className="incidentFilters">
      {(["status", "origin", "branch", "category"] as const).map(field => <label key={field}>{fieldLabels[field]}<select value={filters[field]} onChange={event => setFilters({ ...filters, [field]: event.target.value })}><option value="">Todos</option>{(field === "status" ? statuses : field === "origin" ? origins : field === "branch" ? branches : categories).map(value => <option key={value} value={value}>{label(value)}</option>)}</select></label>)}
    </div>{statusError && <p role="alert" className="error">{statusError}</p>}
      {listLoading ? <p>Cargando incidencias...</p> : listError ? <p role="alert">{listError} <button onClick={() => void loadList()}>Reintentar</button></p> : rows.length === 0 ? <p>No hay incidencias para los filtros seleccionados.</p> : <div className="tableWrap"><table className="incidentTable"><thead><tr><th>Título</th><th>Categoría</th><th>Estado</th><th>Origen</th><th>Sede</th><th>Fecha</th><th>Actualizar</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td title={row.description}>{row.title}</td><td>{label(row.category)}</td><td>{label(row.status)}</td><td>{label(row.origin)}</td><td>{label(row.branch)}</td><td>{new Date(row.created_at).toLocaleDateString("es")}</td><td>{transitions[row.status]?.length ? <select aria-label={`Cambiar estado de ${row.title}`} value="" disabled={pendingId === row.id} onChange={event => void changeStatus(row, event.target.value)}><option value="">Cambiar estado</option>{transitions[row.status].map(next => <option key={next} value={next}>{label(next)}</option>)}</select> : "Final"}</td></tr>)}</tbody></table></div>}
    </section>
  </main>;
}
