import {
  CandidateRecord,
  STAGE_LABELS,
  STATUS_LABELS,
  formatDate,
} from "@/lib/candidates";
import { CandidateDetailItem } from "@/components/candidates/CandidateDetailItem";

type CandidateMainDetailsGridProps = {
  candidate: CandidateRecord;
};

export function CandidateMainDetailsGrid({ candidate }: CandidateMainDetailsGridProps) {
  return (
    <dl className="grid gap-5 text-sm sm:grid-cols-2">
      <CandidateDetailItem label="Email">{candidate.email}</CandidateDetailItem>
      <CandidateDetailItem label="Teléfono">{candidate.phone}</CandidateDetailItem>
      <CandidateDetailItem label="Estado">{STATUS_LABELS[candidate.status]}</CandidateDetailItem>
      <CandidateDetailItem label="Etapa">{STAGE_LABELS[candidate.stage]}</CandidateDetailItem>
      <CandidateDetailItem label="Años de experiencia">{candidate.experience_years}</CandidateDetailItem>
      <CandidateDetailItem label="Notas internas">{candidate.notes_count}</CandidateDetailItem>
      <CandidateDetailItem label="Fecha de aplicación">
        {formatDate(candidate.applied_at)}
      </CandidateDetailItem>
      <CandidateDetailItem label="Última actualización">
        {formatDate(candidate.updated_at)}
      </CandidateDetailItem>
    </dl>
  );
}