const statusStyles: Record<string, string> = {
  open: "bg-danger-soft text-danger",
  in_progress: "bg-warning-soft text-warning",
  resolved: "bg-accent-soft text-accent",
  discarded: "bg-surface-soft text-muted",
};

const statusLabels: Record<string, string> = {
  open: "Abierta",
  in_progress: "En curso",
  resolved: "Resuelta",
  discarded: "Descartada",
};

export function IncidentStatusBadge({ status }: { status: string }) {
  return <span className={`statusBadge ${statusStyles[status] ?? "bg-surface-soft text-muted"}`}>{statusLabels[status] ?? status.replaceAll("_", " ")}</span>;
}
