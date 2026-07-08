import { CandidateFormValues } from "@/lib/candidate-record-form";
import { STAGE_LABELS, STATUS_LABELS } from "@/lib/candidates";

type CandidateRecordFieldsProps = {
  values: CandidateFormValues;
  disabled?: boolean;
  onFieldChange: <T extends keyof CandidateFormValues>(
    field: T,
    value: CandidateFormValues[T],
  ) => void;
};

export function CandidateRecordFields({
  values,
  disabled,
  onFieldChange,
}: CandidateRecordFieldsProps) {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <input className="rounded-md border border-zinc-300 px-3 py-2 text-sm" placeholder="Nombre completo" value={values.full_name} onChange={(event) => onFieldChange("full_name", event.target.value)} disabled={disabled} required />
      <input className="rounded-md border border-zinc-300 px-3 py-2 text-sm" placeholder="Email" type="email" value={values.email} onChange={(event) => onFieldChange("email", event.target.value)} disabled={disabled} required />
      <input className="rounded-md border border-zinc-300 px-3 py-2 text-sm" placeholder="Telefono" value={values.phone} onChange={(event) => onFieldChange("phone", event.target.value)} disabled={disabled} required />
      <input className="rounded-md border border-zinc-300 px-3 py-2 text-sm" placeholder="Puesto" value={values.position} onChange={(event) => onFieldChange("position", event.target.value)} disabled={disabled} required />
      <input className="rounded-md border border-zinc-300 px-3 py-2 text-sm" placeholder="URL de CV" type="url" value={values.cv_url} onChange={(event) => onFieldChange("cv_url", event.target.value)} disabled={disabled} required />
      <input className="rounded-md border border-zinc-300 px-3 py-2 text-sm" placeholder="URL de LinkedIn (opcional)" type="url" value={values.linkedin_url} onChange={(event) => onFieldChange("linkedin_url", event.target.value)} disabled={disabled} />
      <input className="rounded-md border border-zinc-300 px-3 py-2 text-sm" placeholder="Anos de experiencia" type="number" min={0} value={values.experience_years} onChange={(event) => onFieldChange("experience_years", event.target.value)} disabled={disabled} required />
      <select className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" value={values.status} onChange={(event) => onFieldChange("status", event.target.value as CandidateFormValues["status"])} disabled={disabled} required>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <select className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm sm:col-span-2" value={values.stage} onChange={(event) => onFieldChange("stage", event.target.value as CandidateFormValues["stage"])} disabled={disabled} required>
        {Object.entries(STAGE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}