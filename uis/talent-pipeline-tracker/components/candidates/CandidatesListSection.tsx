"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CandidatesFiltersBar } from "@/components/candidates/CandidatesFiltersBar";
import { CandidatesPageHeader } from "@/components/candidates/CandidatesPageHeader";
import { CandidatesTable } from "@/components/candidates/CandidatesTable";
import {
  CandidateRecord,
  CandidateStage,
  CandidateStatus,
} from "@/lib/candidates";

const STATUS_VALUES: CandidateStatus[] = ["received", "in_progress", "selected", "discarded"];
const STAGE_VALUES: CandidateStage[] = [
  "pending",
  "review",
  "personal_interview",
  "technical_interview",
  "offer_presented",
];

type CandidatesListSectionProps = { candidates: CandidateRecord[] };

export function CandidatesListSection({ candidates }: CandidatesListSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  const statusParam = searchParams.get("status");
  const stageParam = searchParams.get("stage");
  const status = STATUS_VALUES.includes(statusParam as CandidateStatus) ? statusParam : "all";
  const stage = STAGE_VALUES.includes(stageParam as CandidateStage) ? stageParam : "all";

  const filteredCandidates = useMemo(() => {
    const term = query.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesStatus = status === "all" || candidate.status === status;
      const matchesStage = stage === "all" || candidate.stage === stage;
      const matchesQuery =
        term.length === 0 ||
        candidate.full_name.toLowerCase().includes(term) ||
        candidate.email.toLowerCase().includes(term);

      return matchesStatus && matchesStage && matchesQuery;
    });
  }, [candidates, query, stage, status]);

  function updateQueryParam(key: "status" | "stage", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }

  return (
    <section className="flex flex-col gap-5">
      <CandidatesPageHeader total={candidates.length} visible={filteredCandidates.length} />
      <CandidatesFiltersBar
        status={status}
        stage={stage}
        query={query}
        onStatusChange={(value) => updateQueryParam("status", value)}
        onStageChange={(value) => updateQueryParam("stage", value)}
        onQueryChange={setQuery}
      />
      <CandidatesTable candidates={filteredCandidates} />
    </section>
  );
}