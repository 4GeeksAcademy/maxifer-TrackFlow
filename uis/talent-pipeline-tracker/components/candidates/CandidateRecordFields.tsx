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

const fieldClass =
  "mt-1 w-full rounded-lg border border-[#c6c6cd] bg-[#fcf8fa] px-3 py-2.5 text-sm text-[#1b1b1d] disabled:opacity-60";
const labelClass = "text-xs font-bold uppercase tracking-[0.08em] text-[#45464d]";

export function CandidateRecordFields({
  values,
  disabled,
  onFieldChange,
}: CandidateRecordFieldsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className={labelClass}>
        Nombre completo
        <input
          className={fieldClass}
          value={values.full_name}
          onChange={(event) => onFieldChange("full_name", event.target.value)}
          disabled={disabled}
          autoFocus
          required
        />
      </label>
      <label className={labelClass}>
        Email
        <input
          className={fieldClass}
          type="email"
          value={values.email}
          onChange={(event) => onFieldChange("email", event.target.value)}
          disabled={disabled}
          required
        />
      </label>
      <label className={labelClass}>
        Teléfono
        <input
          className={fieldClass}
          value={values.phone}
          onChange={(event) => onFieldChange("phone", event.target.value)}
          disabled={disabled}
          required
        />
      </label>
      <label className={labelClass}>
        Puesto
        <input
          className={fieldClass}
          value={values.position}
          onChange={(event) => onFieldChange("position", event.target.value)}
          disabled={disabled}
          required
        />
      </label>
      <label className={labelClass}>
        URL de CV
        <input
          className={fieldClass}
          type="url"
          value={values.cv_url}
          onChange={(event) => onFieldChange("cv_url", event.target.value)}
          disabled={disabled}
          required
        />
      </label>
      <label className={labelClass}>
        URL de LinkedIn
        <input
          className={fieldClass}
          type="url"
          value={values.linkedin_url}
          onChange={(event) => onFieldChange("linkedin_url", event.target.value)}
          disabled={disabled}
          placeholder="Opcional"
        />
      </label>
      <label className={labelClass}>
        Años de experiencia
        <input
          className={fieldClass}
          type="number"
          min={0}
          value={values.experience_years}
          onChange={(event) => onFieldChange("experience_years", event.target.value)}
          disabled={disabled}
          required
        />
      </label>
      <label className={labelClass}>
        Estado
        <select
          className={fieldClass}
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
      <label className={`${labelClass} sm:col-span-2`}>
        Etapa
        <select
          className={fieldClass}
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
