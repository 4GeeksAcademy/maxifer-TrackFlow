"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getIncidents, getIncidentsSummary, type Incident, type Summary } from "@/lib/incidents";

export default function Home() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recent, setRecent] = useState<Incident[]>([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getIncidentsSummary(), getIncidents({})]).then(([totals, rows]) => {
      if (active) { setSummary(totals); setRecent([...rows].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 5)); }
    }).catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, []);

  const byStatus = summary?.by_status ?? {};
  return <main className="dashboard">
    <header className="dashboardIntro"><span className="eyebrow">PANEL DE CONTROL UNIFICADO</span><h1>Centro de operaciones</h1><p>Accesos y actividad del backoffice TrackFlow</p></header>
    <div className="dashboardGrid">
      <section className="featureCard"><div className="featureHeading"><span className="featureIcon">!</span><div><span className="eyebrow">FLUJO OPERATIVO</span><h2>Incidencias operativas</h2></div></div><p>Registrá y seguí los casos de todas las sedes.</p><div className="featureMetrics"><div><span>Abiertas</span><strong>{summary ? byStatus.open ?? 0 : "—"}</strong></div><div><span>En curso</span><strong>{summary ? byStatus.in_progress ?? 0 : "—"}</strong></div><div><span>Resueltas</span><strong>{summary ? byStatus.resolved ?? 0 : "—"}</strong></div></div><div className="featureActions"><Link className="button" href="/incidents">Ir a incidencias →</Link><Link className="button outlineButton" href="/incidents#new-incident">+ Nueva incidencia</Link></div></section>
      <section className="featureCard supplierFeature"><div className="featureHeading"><span className="featureIcon">↗</span><div><span className="eyebrow">RED DE PROVEEDORES</span><h2>Directorio de proveedores y tarifas</h2></div></div><p>Consultá, filtrá y actualizá proveedores desde un mismo lugar.</p><div className="featureMetrics supplierHighlights"><div><span>Directorio</span><strong>Proveedores</strong></div><div><span>Gestión</span><strong>Tarifas</strong></div><div><span>Seguimiento</span><strong>Estados</strong></div></div><div className="featureActions"><Link className="button" href="/suppliers">Gestionar proveedores →</Link><Link className="button outlineButton" href="/suppliers#new-supplier">+ Nuevo proveedor</Link></div></section>
    </div>
    <div className="dashboardLower"><section className="card"><div className="sectionHeading"><div><h2>Últimas incidencias</h2><p>Actividad registrada en el sistema</p></div><Link href="/incidents">Ver todas →</Link></div>{loadError ? <p role="alert">No se pudo cargar la actividad. <Link href="/incidents">Abrir incidencias</Link></p> : !summary ? <p>Cargando actividad…</p> : recent.length ? <div className="tableWrap"><table className="incidentTable"><thead><tr><th>ID</th><th>Asunto</th><th>Sede</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>{recent.map(row => <tr key={row.id}><td>#{row.id}</td><td>{row.title}</td><td>{row.branch.replaceAll("_", " ")}</td><td><span className={`incidentStatus ${row.status}`}>{row.status.replaceAll("_", " ")}</span></td><td>{new Date(row.created_at).toLocaleDateString("es")}</td></tr>)}</tbody></table></div> : <p>Sin incidencias registradas.</p>}</section><aside className="card quickLinks"><h2>Acceso rápido</h2><p>Herramientas para tu jornada</p><Link href="/account/profile">Mi perfil <span>→</span></Link><Link href="/incidents">Gestor de incidencias <span>→</span></Link><Link href="/suppliers">Directorio de proveedores <span>→</span></Link></aside></div>
  </main>;
}
