import { CandidateDetailItem } from "@/components/candidates/CandidateDetailItem";
import type { CandidateRecord } from "@/types/candidates";

type CandidateSecondaryDetailsProps = {
  candidate: CandidateRecord;
};

export function CandidateSecondaryDetails({ candidate }: CandidateSecondaryDetailsProps) {
  return (
    <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
      <CandidateDetailItem label="LinkedIn" fullWidth>
        {candidate.linkedin_url ? (
          <a
            href={candidate.linkedin_url}
            className="underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {candidate.linkedin_url}
          </a>
        ) : (
          "No disponible"
        )}
      </CandidateDetailItem>
      <CandidateDetailItem label="CV" fullWidth>
        <a
          href={candidate.cv_url}
          className="font-medium text-zinc-900 underline-offset-2 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver CV
        </a>
      </CandidateDetailItem>
      <CandidateDetailItem label="ID" fullWidth>
        <span className="break-all text-zinc-700">{candidate.id}</span>
      </CandidateDetailItem>
    </dl>
  );
}
