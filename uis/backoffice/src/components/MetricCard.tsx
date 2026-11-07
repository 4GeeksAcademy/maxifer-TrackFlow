type MetricCardProps = {
  label: string;
  value: number;
  tone: "tone-neutral" | "tone-danger" | "tone-warning" | "tone-success" | "tone-info";
  loading?: boolean;
  loadingLabel?: string;
};

export function MetricCard({ label, value, tone, loading = false, loadingLabel }: MetricCardProps) {
  return <div className={`metricPanel ${tone}`}>
    <span>{label}</span>
    {loading ? <div className="skeletonLine skeletonMetric" aria-label={loadingLabel} /> : <strong>{value}</strong>}
  </div>;
}
