"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { branches, branchLabels, categories, createIncident, getIncidents, getIncidentsSummary, IncidentApiError, origins, statuses, transitions, updateIncidentStatus } from "@/lib/incidents";
import type { Incident, IncidentInput, Summary } from "@/lib/incidents";

const initialForm: IncidentInput = { title: "", description: "", category: "carrier_issue", status: "open", origin: "internal", branch: "central" };
const fieldLabels: Record<string, string> = { title: "Título", description: "Descripción", category: "Categoría", status: "Estado", origin: "Origen", branch: "Sede" };
const statusLabels: Record<string, string> = { open: "Abierta", in_progress: "En curso", resolved: "Resuelta", discarded: "Descartada" };
const originLabels: Record<string, string> = { customer: "Cliente", branch: "Sede", internal: "Interno" };
const categoryLabels: Record<string, string> = { lost_parcel: "Paquete perdido", delivery_failure: "Fallo de entrega", inventory_discrepancy: "Diferencia de inventario", carrier_issue: "Transportista", returns_issue: "Devoluciones", warehouse_incident: "Incidencia de almacén", system_failure: "Fallo del sistema", client_complaint: "Queja de cliente", other: "Otros" };
const label = (key: string) => branchLabels[key] || statusLabels[key] || originLabels[key] || categoryLabels[key] || key.replaceAll("_", " ");
const pageSize = 10;

export default function IncidentsPage() {
  const [form, setForm] = useState<IncidentInput>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formMessage, setFormMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const createDialog = useRef<HTMLDialogElement>(null);
  const createButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (window.location.hash === "#new-incident" && !createDialog.current?.open) createDialog.current?.showModal();
  }, []);
  const [filters, setFilters] = useState({ status: "", origin: "", branch: "", category: "" });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
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
      createDialog.current?.close();
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

  const query = search.trim().toLocaleLowerCase("es");
  const visibleRows = rows.filter(row => !query || [String(row.id), row.title, row.description, row.branch, label(row.branch)].some(value => value.toLocaleLowerCase("es").includes(query)));
  const totalPages = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = visibleRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const statusCounts = summary?.by_status ?? {};
  const activeCount = (statusCounts.open ?? 0) + (statusCounts.in_progress ?? 0);
  const topCategories = Object.entries(summary?.by_category ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return <main className="container incidentsPage">
    <header className="pageHeader incidentsHeader"><div><span className="eyebrow">TRACKFLOW HUB / OPERACIONES</span><h1>Gestión de incidencias</h1><p>Registrá y seguí los casos de todas las sedes.</p></div><button ref={createButton} type="button" className="incidentHeaderAction" onClick={() => { setFormMessage(""); createDialog.current?.showModal(); }}>+ Registrar incidencia</button></header>
    {formMessage.includes("correctamente") && <p role="status" className="successMessage incidentCreatedMessage">{formMessage}</p>}

    <section className="incidentOverview" aria-label="Resumen operativo">
      <div className="incidentStat incidentStatTotal"><span>TOTAL INCIDENCIAS ACTIVAS</span><strong>{summaryLoading ? "—" : activeCount}</strong><small>en la red de distribución</small><div>Total registrado: <b>{summary?.total ?? "—"}</b></div></div>
      <div className="incidentStat incidentStateSummary"><span>DESGLOSE POR ESTADO</span><div className="incidentStateGrid">{statuses.map(status => <div key={status} className={`incidentStateBox ${status}`}><span>{label(status)}</span><strong>{summaryLoading ? "—" : statusCounts[status] ?? 0}</strong></div>)}</div></div>
      <div className="incidentStat"><span>POR ORIGEN</span>{Object.entries(summary?.by_origin ?? {}).length ? <div className="incidentMiniList">{Object.entries(summary?.by_origin ?? {}).map(([origin, count]) => <div key={origin}><span>{label(origin)}</span><strong>{count}</strong></div>)}</div> : <p>{summaryLoading ? "Cargando…" : "Sin datos"}</p>}</div>
      <div className="incidentStat"><span>DESGLOSE POR SEDE</span>{Object.entries(summary?.by_branch ?? {}).length ? <div className="incidentMiniList">{Object.entries(summary?.by_branch ?? {}).map(([branch, count]) => <div key={branch}><span>{label(branch)}</span><strong>{count}</strong></div>)}</div> : <p>{summaryLoading ? "Cargando…" : "Sin datos"}</p>}</div>
    </section>
    {summaryError && <p role="alert" className="error">{summaryError} <button type="button" onClick={() => void loadSummary()}>Reintentar</button></p>}

    <section className="incidentCategoryStrip"><div className="incidentStripHeading"><span>CATEGORÍAS MÁS FRECUENTES</span><small>{summary?.total ?? "—"} incidencias registradas</small></div><div className="incidentCategoryItems">{topCategories.length ? topCategories.map(([category, count]) => <div key={category}><span>{label(category)}</span><strong>{count}</strong></div>) : <p>{summaryLoading ? "Cargando categorías…" : "Sin datos"}</p>}</div></section>

    <dialog id="new-incident" ref={createDialog} className="incidentModal" aria-labelledby="incident-modal-title" onClose={() => createButton.current?.focus()} onClick={event => { if (event.target === event.currentTarget) createDialog.current?.close(); }}>
    <section className="card incidentCreateCard"><header className="incidentPanelHeading"><div><h2 id="incident-modal-title">Registro rápido de incidencia</h2><p>Apertura de casos para seguimiento operativo</p></div><button type="button" className="incidentModalClose" onClick={() => createDialog.current?.close()} aria-label="Cerrar formulario">×</button></header>
      <form className="incidentForm" onSubmit={submit} noValidate>
        <label className="incidentTitle">Título de la incidencia <input autoFocus value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} maxLength={121} placeholder="Ej. Retraso en entrega por revisión de aduana" aria-invalid={!!fieldErrors.title} /><small className="incidentCounter">{form.title.length} / 120 caracteres</small>{fieldErrors.title && <small className="fieldError">{fieldErrors.title}</small>}</label>
        <label>Categoría operativa <select value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} aria-invalid={!!fieldErrors.category}>{categories.map(value => <option key={value} value={value}>{label(value)}</option>)}</select>{fieldErrors.category && <small className="fieldError">{fieldErrors.category}</small>}</label>
        <label>Origen del reporte <select value={form.origin} onChange={event => setForm({ ...form, origin: event.target.value })} aria-invalid={!!fieldErrors.origin}>{origins.map(value => <option key={value} value={value}>{label(value)}</option>)}</select>{fieldErrors.origin && <small className="fieldError">{fieldErrors.origin}</small>}</label>
        <label className={form.origin === "branch" ? "branchRequired" : ""}>Sede de origen / afectada <select value={form.branch} onChange={event => setForm({ ...form, branch: event.target.value })} aria-invalid={!!fieldErrors.branch}>{branches.map(value => <option key={value} value={value}>{label(value)}</option>)}</select>{fieldErrors.branch && <small className="fieldError">{fieldErrors.branch}</small>}</label>
        <label>Estado inicial <select value={form.status} onChange={event => setForm({ ...form, status: event.target.value })} aria-invalid={!!fieldErrors.status}>{statuses.map(value => <option key={value} value={value}>{label(value)}</option>)}</select>{fieldErrors.status && <small className="fieldError">{fieldErrors.status}</small>}</label>
        <label className="incidentWide">Descripción detallada <textarea value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} placeholder="Describí el incidente, el lote afectado y las medidas tomadas…" aria-invalid={!!fieldErrors.description} />{fieldErrors.description && <small className="fieldError">{fieldErrors.description}</small>}</label>
        <div className="incidentWide incidentFormActions"><button type="button" className="mutedButton" onClick={() => { setForm(initialForm); setFieldErrors({}); setFormMessage(""); }}>Limpiar formulario</button><button type="submit" disabled={saving}>{saving ? "Guardando…" : "Registrar incidencia"}</button></div>
      </form>{formMessage && !formMessage.includes("correctamente") && <p role="alert" className="error">{formMessage}</p>}
    </section>
    </dialog>

    <section className="incidentFiltersPanel" aria-label="Filtrar incidencias"><div className="incidentSearch"><label htmlFor="incident-search">Buscar incidencia</label><input id="incident-search" type="search" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="ID, título, descripción o sede…" /></div><div className="incidentFilters">{(["status", "origin", "branch", "category"] as const).map(field => <label key={field}>{fieldLabels[field]}<select value={filters[field]} onChange={event => { setFilters({ ...filters, [field]: event.target.value }); setPage(1); }}><option value="">Todos</option>{(field === "status" ? statuses : field === "origin" ? origins : field === "branch" ? branches : categories).map(value => <option key={value} value={value}>{label(value)}</option>)}</select></label>)}</div><button type="button" className="incidentRefresh" onClick={() => { void loadList(); void loadSummary(); }} aria-label="Actualizar incidencias">↻</button></section>
    {statusError && <p role="alert" className="error">{statusError}</p>}

    <section className="card incidentListCard"><header className="incidentListHeading"><h2>Casos registrados</h2><span>Mostrando {visibleRows.length} de {summary?.total ?? rows.length} casos</span></header>
      {listLoading ? <p className="incidentFeedback">Cargando incidencias…</p> : listError ? <p role="alert" className="incidentFeedback">{listError} <button type="button" onClick={() => void loadList()}>Reintentar</button></p> : pageRows.length === 0 ? <p className="incidentFeedback">No hay incidencias para los filtros seleccionados.</p> : <div className="tableWrap"><table className="incidentTable"><thead><tr><th>Exp.</th><th>ID y título del caso</th><th>Categoría</th><th>Estado actual</th><th>Origen</th><th>Sede</th><th>Fecha</th><th>Transición permitida</th></tr></thead><tbody>{pageRows.map(row => <FragmentRow key={row.id} row={row} expanded={expandedId === row.id} onToggle={() => setExpandedId(id => id === row.id ? null : row.id)} pending={pendingId === row.id} onStatusChange={next => void changeStatus(row, next)} />)}</tbody></table></div>}
      <footer className="incidentPager"><span>Filas por página: {pageSize} · Página {currentPage} de {totalPages}</span><div><button type="button" className="mutedButton" disabled={currentPage === 1} onClick={() => setPage(value => value - 1)} aria-label="Página anterior">‹</button><button type="button" className="mutedButton" disabled={currentPage === totalPages} onClick={() => setPage(value => value + 1)} aria-label="Página siguiente">›</button></div></footer>
    </section>
  </main>;
}

function FragmentRow({ row, expanded, onToggle, pending, onStatusChange }: { row: Incident; expanded: boolean; onToggle: () => void; pending: boolean; onStatusChange: (next: string) => void }) {
  return <><tr><td><button type="button" className="incidentExpand" onClick={onToggle} aria-expanded={expanded} aria-label={`${expanded ? "Ocultar" : "Ver"} detalle de ${row.title}`}>{expanded ? "⌄" : "›"}</button></td><td><div className="incidentCase"><strong>#{row.id}</strong><span>{row.title}</span></div></td><td><span className="incidentCategoryBadge">{label(row.category)}</span></td><td><span className={`incidentStatus ${row.status}`}>{label(row.status)}</span></td><td><span className="incidentOrigin">{label(row.origin)}</span></td><td>{label(row.branch)}</td><td>{new Date(row.created_at).toLocaleDateString("es")}</td><td>{transitions[row.status]?.length ? <select aria-label={`Cambiar estado de ${row.title}`} value="" disabled={pending} onChange={event => onStatusChange(event.target.value)}><option value="">Cambiar estado</option>{transitions[row.status].map(next => <option key={next} value={next}>{label(next)}</option>)}</select> : <span className="incidentFinal">Estado final</span>}</td></tr>{expanded && <tr className="incidentDetailsRow"><td colSpan={8}><div><strong>Descripción de la incidencia</strong><p>{row.description}</p><small>Creada: {new Date(row.created_at).toLocaleString("es")} · Actualizada: {new Date(row.updated_at).toLocaleString("es")}</small></div></td></tr>}</>;
}
