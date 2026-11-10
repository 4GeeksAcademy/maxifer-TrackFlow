"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { branches, branchLabels, categories, getIncidents, getIncidentsSummary, origins, statuses, transitions, updateIncidentStatus } from "@/lib/incidents";
import type { Incident, Summary } from "@/lib/incidents";
import { IncidentStatusBadge } from "@/components/IncidentStatusBadge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

const pageSize = 10;
const fieldLabels: Record<string, string> = { title: "Título", description: "Descripción", category: "Categoría", status: "Estado", origin: "Origen", branch: "Sede" };
const label = (key: string) => branchLabels[key] || key.replaceAll("_", " ");
const summaryTone = (group: string, key: string) => group === "by_status"
  ? ({ open: "tone-danger", in_progress: "tone-warning", resolved: "tone-success", discarded: "tone-neutral" }[key] ?? "tone-neutral")
  : "tone-neutral";

const IncidentCreateDialog = dynamic(() => import("@/components/IncidentCreateDialog"), { loading: () => <p role="status">Cargando formulario de incidencia...</p> });

export default function IncidentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [filters, setFilters] = useState({ status: "", origin: "", branch: "", category: "" });
  const [rows, setRows] = useState<Incident[]>([]);
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const listRequest = useRef(0);
  const pageCount = Math.ceil(rows.length / pageSize);
  const currentPage = Math.min(page, Math.max(pageCount, 1));
  const pageRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
  useEffect(() => {
    const openFromHash = () => { if (window.location.hash === "#new-incident") setDialogOpen(true); };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  function closeDialog() {
    setDialogOpen(false);
    if (window.location.hash === "#new-incident") history.replaceState(null, "", window.location.pathname + window.location.search);
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
    <header className="pageHeader"><span className="eyebrow">Operaciones / Incidencias</span><div className="pageHeaderTitleRow"><h1>Gestión de incidencias</h1><button id="new-incident" type="button" className="button" onClick={() => { setFormMessage(""); setDialogOpen(true); }}>Registrar incidencia</button></div><p>Registrá y seguí los casos de todas las sedes de TrackFlow.</p></header>
    {formMessage.includes("correctamente") && <p role="status" className="successMessage mb-5">{formMessage}</p>}
    {dialogOpen && <IncidentCreateDialog onClose={closeDialog} onCreated={message => { setFormMessage(message); setPage(1); void loadList(); void loadSummary(); }} />}
    <section className="card"><h2>Resumen de incidencias</h2>
      {summaryLoading ? <LoadingSkeleton label="Cargando resumen de incidencias" variant="summary" /> : summaryError ? <p role="alert">{summaryError} <button onClick={() => void loadSummary()}>Reintentar</button></p> : summary && <><p className="summaryTotal">Total: <strong>{summary.total}</strong></p><div className="summaryGrid">{(["by_status", "by_category", "by_origin", "by_branch"] as const).map(group => <div key={group}><h3>{{ by_status: "Por estado", by_category: "Por categoría", by_origin: "Por origen", by_branch: "Por sede" }[group]}</h3>{Object.keys(summary[group]).length ? <ul className="dataList">{Object.entries(summary[group]).map(([key, count]) => <li key={key} className={summaryTone(group, key)}><span>{label(key)}</span><strong>{count}</strong></li>)}</ul> : <p>Sin datos</p>}</div>)}</div></>}
    </section>
    <section className="card"><h2>Incidencias</h2><div className="incidentFilters">
      {(["status", "origin", "branch", "category"] as const).map(field => <label key={field}>{fieldLabels[field]}<select value={filters[field]} onChange={event => { setPage(1); setFilters({ ...filters, [field]: event.target.value }); }}><option value="">Todos</option>{(field === "status" ? statuses : field === "origin" ? origins : field === "branch" ? branches : categories).map(value => <option key={value} value={value}>{label(value)}</option>)}</select></label>)}
    </div>{statusError && <p role="alert" className="error">{statusError}</p>}
      {listLoading ? <LoadingSkeleton label="Cargando incidencias" variant="table" columns={7} /> : listError ? <p role="alert">{listError} <button onClick={() => void loadList()}>Reintentar</button></p> : rows.length === 0 ? <p>No hay incidencias para los filtros seleccionados.</p> : <><div className="tableWrap"><table className="incidentTable"><thead><tr><th>Título</th><th>Categoría</th><th>Estado</th><th>Origen</th><th>Sede</th><th>Fecha</th><th>Actualizar</th></tr></thead><tbody>{pageRows.map(row => <tr key={row.id}><td title={row.description}>{row.title}</td><td>{label(row.category)}</td><td><IncidentStatusBadge status={row.status} /></td><td>{label(row.origin)}</td><td>{label(row.branch)}</td><td>{new Date(row.created_at).toLocaleDateString("es")}</td><td>{transitions[row.status]?.length ? <select aria-label={`Cambiar estado de ${row.title}`} value="" disabled={pendingId === row.id} onChange={event => void changeStatus(row, event.target.value)}><option value="">Cambiar estado</option>{transitions[row.status].map(next => <option key={next} value={next}>{label(next)}</option>)}</select> : "Final"}</td></tr>)}</tbody></table></div><nav className="incidentPagination" aria-label="Paginación de incidencias"><span>Mostrando {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, rows.length)} de {rows.length}</span><div><button type="button" className="button secondaryButton" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Anterior</button><span aria-live="polite">Página {currentPage} de {pageCount}</span><button type="button" className="button secondaryButton" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Siguiente</button></div></nav></>}
    </section>
  </main>;
}
