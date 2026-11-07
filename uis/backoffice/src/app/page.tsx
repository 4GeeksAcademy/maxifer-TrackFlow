"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/auth";
import { getIncidents, getIncidentsSummary, branchLabels } from "@/lib/incidents";
import type { Incident, Summary } from "@/lib/incidents";
import { IncidentStatusBadge } from "@/components/IncidentStatusBadge";
import { MetricCard } from "@/components/MetricCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

type SupplierOverview = { id: string; status: "active" | "suspended"; country: string };

export default function Home() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recent, setRecent] = useState<Incident[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOverview[] | null>(null);
  const [incidentsError, setIncidentsError] = useState("");
  const [suppliersError, setSuppliersError] = useState("");
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const [summaryResult, incidentsResult, suppliersResult] = await Promise.allSettled([
        getIncidentsSummary(),
        getIncidents({}),
        apiFetch("/backend/suppliers").then(async response => {
          if (!response.ok) throw new Error("No se pudo cargar el directorio.");
          return response.json() as Promise<SupplierOverview[]>;
        }),
      ]);
      if (!active) return;
      if (summaryResult.status === "fulfilled") setSummary(summaryResult.value);
      else setIncidentsError("No se pudo cargar el resumen de incidencias.");
      if (incidentsResult.status === "fulfilled") setRecent([...incidentsResult.value].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 5));
      else setIncidentsError("No se pudieron cargar las incidencias.");
      setRecentLoading(false);
      if (suppliersResult.status === "fulfilled") setSuppliers(suppliersResult.value);
      else setSuppliersError("No se pudieron cargar los proveedores.");
    }
    void load();
    return () => { active = false; };
  }, []);

  const activeSuppliers = suppliers?.filter(supplier => supplier.status === "active").length;
  return <main className="container">
    <header className="pageHeader"><span className="eyebrow">Panel de control unificado</span><h1>Backoffice operativo</h1><p>Resumen actual de incidencias y proveedores de TrackFlow.</p></header>
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="card flex flex-col">
        <span className="eyebrow">Flujo operativo</span><h2 className="mt-2">Gestión de incidencias</h2>
        <div className="grid">
          <div className={`col-start-1 row-start-1 grid grid-cols-2 gap-3 sm:grid-cols-4${incidentsError ? " invisible" : ""}`} aria-hidden={incidentsError ? true : undefined} role={!summary && !incidentsError ? "status" : undefined} aria-label={!summary && !incidentsError ? "Cargando resumen de incidencias" : undefined}>
            {([["Total", summary?.total ?? 0, "tone-neutral"], ["Abiertas", summary?.by_status.open ?? 0, "tone-danger"], ["En curso", summary?.by_status.in_progress ?? 0, "tone-warning"], ["Resueltas", summary?.by_status.resolved ?? 0, "tone-success"]] as const).map(([label, value, tone]) => <MetricCard key={label} label={label} value={value} tone={tone} loading={!summary} />)}
          </div>
          {incidentsError && <p role="alert" className="error col-start-1 row-start-1 self-start">{incidentsError}</p>}
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-5"><Link href="/incidents" className="button">Ir a incidencias →</Link><Link href="/incidents#new-incident" className="button secondaryButton">Registrar incidencia</Link></div>
      </section>
      <section className="card flex flex-col">
        <span className="eyebrow">Red de proveedores</span><h2 className="mt-2">Directorio de proveedores y tarifas</h2>
        <div className="grid">
          <div className={`col-start-1 row-start-1 grid grid-cols-2 gap-3 sm:grid-cols-3${suppliersError ? " invisible" : ""}`} aria-hidden={suppliersError ? true : undefined} role={!suppliers && !suppliersError ? "status" : undefined} aria-label={!suppliers && !suppliersError ? "Cargando resumen de proveedores" : undefined}>
            {([["Total", suppliers?.length ?? 0, "tone-info"], ["Activos", activeSuppliers ?? 0, "tone-success"], ["Suspendidos", (suppliers?.length ?? 0) - (activeSuppliers ?? 0), "tone-danger"]] as const).map(([label, value, tone]) => <MetricCard key={label} label={label} value={value} tone={tone} loading={!suppliers} />)}
          </div>
          {suppliersError && <p role="alert" className="error col-start-1 row-start-1 self-start">{suppliersError}</p>}
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-5"><Link href="/suppliers" className="button">Gestionar proveedores →</Link><Link href="/suppliers#new-supplier" className="button secondaryButton">Nuevo proveedor</Link></div>
      </section>
    </div>
    <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
      <section className="card"><h2>Incidencias recientes</h2>{recentLoading ? <LoadingSkeleton label="Cargando incidencias recientes" variant="table" columns={5} /> : recent.length ? <div className="tableWrap"><table className="incidentTable"><thead><tr><th>ID</th><th>Asunto</th><th>Sede</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>{recent.map(row => <tr key={row.id}><td className="font-semibold text-accent">#{row.id}</td><td>{row.title}</td><td>{branchLabels[row.branch] ?? row.branch}</td><td><IncidentStatusBadge status={row.status} /></td><td>{new Date(row.created_at).toLocaleDateString("es")}</td></tr>)}</tbody></table></div> : <p className="text-sm text-muted">{incidentsError || "No hay incidencias recientes."}</p>}</section>
      <section className="card"><h2>Desglose por sede</h2>{summary ? <ul className="dataList">{Object.entries(summary.by_branch).map(([branch, count]) => <li key={branch}><span>{branchLabels[branch] ?? branch}</span><strong>{count}</strong></li>)}</ul> : incidentsError ? <p role="alert" className="error">{incidentsError}</p> : <LoadingSkeleton label="Cargando desglose por sede" variant="table" columns={2} />}<Link href="/account/profile" className="mt-5 inline-block text-sm font-semibold text-accent hover:underline">Mi perfil →</Link></section>
    </div>
  </main>;
}
