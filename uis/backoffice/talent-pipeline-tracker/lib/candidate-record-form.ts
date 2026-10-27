import { CandidateRecord, CandidateRecordUpsertPayload } from "@/types/candidates";

export type CandidateFormValues = {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string;
  cv_url: string;
  status: CandidateRecord["status"];
  stage: CandidateRecord["stage"];
  experience_years: string;
};

export const EMPTY_CANDIDATE_FORM: CandidateFormValues = {
  full_name: "",
  email: "",
  phone: "",
  position: "",
  linkedin_url: "",
  cv_url: "",
  status: "received",
  stage: "pending",
  experience_years: "0",
};

const REQUIRED_FIELDS: Array<keyof CandidateFormValues> = [
  "full_name",
  "email",
  "phone",
  "position",
  "cv_url",
  "status",
  "stage",
  "experience_years",
];

const REQUIRED_MESSAGES: Record<keyof CandidateFormValues, string> = {
  full_name: "El nombre es obligatorio.",
  email: "El email es obligatorio.",
  phone: "El teléfono es obligatorio.",
  position: "El puesto es obligatorio.",
  linkedin_url: "",
  cv_url: "La URL del CV es obligatoria.",
  status: "El estado es obligatorio.",
  stage: "La etapa es obligatoria.",
  experience_years: "Los años de experiencia son obligatorios.",
};

export function candidateToFormValues(candidate: CandidateRecord): CandidateFormValues {
  return {
    full_name: candidate.full_name,
    email: candidate.email,
    phone: candidate.phone,
    position: candidate.position,
    linkedin_url: candidate.linkedin_url ?? "",
    cv_url: candidate.cv_url,
    status: candidate.status,
    stage: candidate.stage,
    experience_years: String(candidate.experience_years),
  };
}

export function validateCandidateFormValues(values: CandidateFormValues): string | null {
  for (const field of REQUIRED_FIELDS) {
    if (!values[field].trim()) {
      return REQUIRED_MESSAGES[field];
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    return "El email no tiene un formato válido.";
  }

  const years = Number(values.experience_years);
  if (!Number.isFinite(years) || years < 0) {
    return "Los años de experiencia deben ser un número igual o mayor a 0.";
  }

  return null;
}

export function formValuesToPayload(values: CandidateFormValues): CandidateRecordUpsertPayload {
  return {
    full_name: values.full_name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    position: values.position.trim(),
    linkedin_url: values.linkedin_url.trim() || null,
    cv_url: values.cv_url.trim(),
    status: values.status,
    stage: values.stage,
    experience_years: Number(values.experience_years),
  };
}
