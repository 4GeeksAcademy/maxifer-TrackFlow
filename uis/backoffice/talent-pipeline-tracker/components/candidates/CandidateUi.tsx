import { CheckCircle2, Clock3, RefreshCw, XCircle } from "lucide-react";
import { STAGE_LABELS, STATUS_LABELS } from "@/lib/candidates";
import type { CandidateRecord, CandidateStage, CandidateStatus } from "@/types/candidates";

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function StatusBadge({ status }: { status: CandidateStatus }) {
  const classes: Record<CandidateStatus, string> = {
    received: "border-slate-200 bg-slate-100 text-slate-700",
    in_progress: "border-blue-100 bg-blue-50 text-blue-700",
    selected: "border-emerald-100 bg-emerald-50 text-emerald-700",
    discarded: "border-red-100 bg-red-50 text-red-700",
  };

  return (
    <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${classes[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function StageBadge({ stage }: { stage: CandidateStage }) {
  return (
    <span className="inline-flex w-fit items-center rounded-md border border-[#c6c6cd] bg-[#fcf8fa] px-2.5 py-0.5 text-xs font-medium text-[#45464d]">
      {STAGE_LABELS[stage]}
    </span>
  );
}

export function CandidateAvatar({ name, status }: Pick<CandidateRecord, "status"> & { name: string }) {
  const classes: Record<CandidateStatus, string> = {
    received: "bg-[#e4e2e4] text-[#45464d]",
    in_progress: "bg-[#2170e4] text-white",
    selected: "bg-[#131b2e] text-[#d8e2ff]",
    discarded: "bg-red-50 text-red-700",
  };

  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${classes[status]}`}>
      {getInitials(name)}
    </span>
  );
}

export const metricStyles = {
  total: { iconClass: "bg-[#e4e2e4] text-black", icon: CheckCircle2 },
  pending: { iconClass: "bg-amber-50 text-amber-700", icon: Clock3 },
  progress: { iconClass: "bg-blue-50 text-blue-700", icon: RefreshCw },
  selected: { iconClass: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  discarded: { iconClass: "bg-red-50 text-red-700", icon: XCircle },
};
