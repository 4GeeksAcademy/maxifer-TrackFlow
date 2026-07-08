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
      <label className="text-xs font-medium text-zinc-600">
        Nombre completo
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
          value={values.full_name}
          onChange={(event) => onFieldChange("full_name", event.target.value)}
          disabled={disabled}
          required
        />
      </label>
      <label className="text-xs font-medium text-zinc-600">
        Email
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
          type="email"
          value={values.email}
          onChange={(event) => onFieldChange("email", event.target.value)}
          disabled={disabled}
          required
        />
      </label>
      <label className="text-xs font-medium text-zinc-600">
        Teléfono
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
          value={values.phone}
          onChange={(event) => onFieldChange("phone", event.target.value)}
          disabled={disabled}
          required
        />
      </label>
      <label className="text-xs font-medium text-zinc-600">
        Puesto
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
          value={values.position}
          onChange={(event) => onFieldChange("position", event.target.value)}
          disabled={disabled}
          required
        />
      </label>
      <label className="text-xs font-medium text-zinc-600">
        URL de CV
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
          type="url"
          value={values.cv_url}
          onChange={(event) => onFieldChange("cv_url", event.target.value)}
          disabled={disabled}
          required
        />
      </label>
      <label className="text-xs font-medium text-zinc-600">
        URL de LinkedIn
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
          type="url"
          value={values.linkedin_url}
          onChange={(event) => onFieldChange("linkedin_url", event.target.value)}
          disabled={disabled}
          placeholder="Opcional"
        />
      </label>
      <label className="text-xs font-medium text-zinc-600">
        Años de experiencia
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
          type="number"
          min={0}
          value={values.experience_years}
          onChange={(event) => onFieldChange("experience_years", event.target.value)}
          disabled={disabled}
          required
        />
      </label>
      <label className="text-xs font-medium text-zinc-600">
        Estado
        <select
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
          value={values.status}
          onChange={(event) =>
            onFieldChange("status", event.target.value as CandidateFormValues["status"])
          }
          disabled={disabled}
          required
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs font-medium text-zinc-600 sm:col-span-2">
        Etapa
        <select
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
          value={values.stage}
          onChange={(event) =>
            onFieldChange("stage", event.target.value as CandidateFormValues["stage"])
          }
          disabled={disabled}
          required
        >
          {Object.entries(STAGE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
