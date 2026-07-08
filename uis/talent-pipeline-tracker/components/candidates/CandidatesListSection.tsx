"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CandidatesFiltersBar } from "@/components/candidates/CandidatesFiltersBar";
import { CandidateCreateForm } from "@/components/candidates/CandidateCreateForm";
import { CandidatesPageHeader } from "@/components/candidates/CandidatesPageHeader";
import { CandidatesTable } from "@/components/candidates/CandidatesTable";
import {
  CANDIDATE_STAGE_VALUES,
  CANDIDATE_STATUS_VALUES,
} from "@/lib/candidates";
import type {
  CandidateRecord,
  CandidateStage,
  CandidateStatus,
} from "@/types/candidates";

type CandidatesListSectionProps = { candidates: CandidateRecord[] };
type StatusFilter = CandidateStatus | "all";
type StageFilter = CandidateStage | "all";

function isCandidateStatus(value: string | null): value is CandidateStatus {
  return CANDIDATE_STATUS_VALUES.includes(value as CandidateStatus);
}

function isCandidateStage(value: string | null): value is CandidateStage {
  return CANDIDATE_STAGE_VALUES.includes(value as CandidateStage);
}

export function CandidatesListSection({ candidates }: CandidatesListSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [candidatesState, setCandidatesState] = useState(candidates);
  const [query, setQuery] = useState("");

  const statusParam = searchParams.get("status");
  const stageParam = searchParams.get("stage");
  const status: StatusFilter = isCandidateStatus(statusParam) ? statusParam : "all";
  const stage: StageFilter = isCandidateStage(stageParam) ? stageParam : "all";

  const filteredCandidates = useMemo(() => {
    const term = query.trim().toLowerCase();

    return candidatesState.filter((candidate) => {
      const matchesStatus = status === "all" || candidate.status === status;
      const matchesStage = stage === "all" || candidate.stage === stage;
      const matchesQuery =
        term.length === 0 ||
        candidate.full_name.toLowerCase().includes(term) ||
        candidate.email.toLowerCase().includes(term);

      return matchesStatus && matchesStage && matchesQuery;
    });
  }, [candidatesState, query, stage, status]);

  function handleCandidateCreated(candidate: CandidateRecord) {
    setCandidatesState((current) => [candidate, ...current.filter((item) => item.id !== candidate.id)]);
  }

  function updateQueryParam(key: "status" | "stage", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }

  return (
    <section className="flex flex-col gap-5">
      <CandidatesPageHeader total={candidatesState.length} visible={filteredCandidates.length} />
      <CandidateCreateForm onCreated={handleCandidateCreated} />
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
