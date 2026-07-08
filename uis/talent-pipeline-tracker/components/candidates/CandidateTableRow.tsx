import Link from "next/link";
import { CandidateRecord, STAGE_LABELS, STATUS_LABELS } from "@/lib/candidates";

type CandidateTableRowProps = {
  candidate: CandidateRecord;
};

export function CandidateTableRow({ candidate }: CandidateTableRowProps) {
  return (
    <tr className="transition-colors hover:bg-zinc-50">
      <td className="px-4 py-3">
        <Link
          href={`/candidates/${candidate.id}`}
          className="font-medium text-zinc-900 underline-offset-2 hover:underline"
        >
          {candidate.full_name}
        </Link>
        <p className="mt-0.5 text-xs text-zinc-500">{candidate.email}</p>
      </td>
      <td className="px-4 py-3 text-zinc-700">{candidate.position}</td>
      <td className="px-4 py-3 text-zinc-700">{STATUS_LABELS[candidate.status]}</td>
      <td className="px-4 py-3 text-zinc-700">{STAGE_LABELS[candidate.stage]}</td>
    </tr>
  );
}