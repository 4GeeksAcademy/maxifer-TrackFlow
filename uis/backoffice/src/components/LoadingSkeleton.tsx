type LoadingSkeletonProps = {
  label: string;
  variant: "summary" | "table";
  columns?: number;
};

export function LoadingSkeleton({ label, variant, columns = 6 }: LoadingSkeletonProps) {
  return <div role="status" aria-label={label} className="loadingSkeleton">
    <span className="sr-only">{label}</span>
    {variant === "summary" ? <>
      <div className="skeletonLine skeletonTotal" />
      <div className="summaryGrid" aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <div key={index} className="skeletonSummaryCard"><div className="skeletonLine skeletonHeading" /><div className="skeletonLine" /><div className="skeletonLine skeletonShort" /></div>)}</div>
    </> : <div className="skeletonTable" aria-hidden="true">{Array.from({ length: 5 }, (_, row) => <div key={row} className="skeletonTableRow" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{Array.from({ length: columns }, (_, column) => <div key={column} className={`skeletonLine${column % 3 === 0 ? " skeletonShort" : ""}`} />)}</div>)}</div>}
  </div>;
}
