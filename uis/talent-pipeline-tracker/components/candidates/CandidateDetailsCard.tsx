"use client";

import { FormEvent, ReactNode, useState, useTransition } from "react";
import { Edit3, FileText, MapPin, ShieldCheck } from "lucide-react";
import { CandidateNotesSection } from "@/components/candidates/CandidateNotesSection";
import { CandidateStatusStageControls } from "@/components/candidates/CandidateStatusStageControls";
import { CandidateAvatar, StageBadge, StatusBadge } from "@/components/candidates/CandidateUi";
import {
  candidateToFormValues,
  formValuesToPayload,
  validateCandidateFormValues,
  type CandidateFormValues,
} from "@/lib/candidate-record-form";
import { STAGE_LABELS, formatDate } from "@/lib/candidates";
import { replaceCandidateRecord } from "@/lib/candidates";
import type { CandidateNote, CandidateRecord, CandidateStage } from "@/types/candidates";

type CandidateDetailsCardProps = {
  candidate: CandidateRecord;
  notes: CandidateNote[];
  initialEditMode?: boolean;
};

const steps: Array<{ stage: CandidateStage; label: string; shortLabel: string }> = [
  { stage: "pending", label: "Pendiente de revision", shortLabel: "Recibida" },
  { stage: "review", label: "En revision", shortLabel: "Revision" },
  { stage: "personal_interview", label: "Entrevista personal", shortLabel: "Entrevista" },
  { stage: "offer_presented", label: "Oferta presentada", shortLabel: "Oferta" },
];

function stageIndex(stage: CandidateStage) {
  if (stage === "technical_interview") return 2;
  const index = steps.findIndex((step) => step.stage === stage);
  return index === -1 ? 0 : index;
}

export function CandidateDetailsCard({
  candidate,
  notes,
  initialEditMode = false,
}: CandidateDetailsCardProps) {
  const [candidateState, setCandidateState] = useState(candidate);
  const [isEditingDetails, setIsEditingDetails] = useState(initialEditMode);
  const [detailsValues, setDetailsValues] = useState(() => candidateToFormValues(candidate));
  const [isSavingDetails, startSavingDetails] = useTransition();
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const currentStepIndex = stageIndex(candidateState.stage);

  function handleNotesCountChange(count: number) {
    setCandidateState((current) => ({ ...current, notes_count: count }));
  }

  function updateCandidateState(updatedCandidate: CandidateRecord) {
    setCandidateState(updatedCandidate);
    setDetailsValues(candidateToFormValues(updatedCandidate));
  }

  function handleDetailFieldChange<T extends keyof CandidateFormValues>(
    field: T,
    value: CandidateFormValues[T],
  ) {
    setDetailsValues((current) => ({ ...current, [field]: value }));
  }

  function startDetailsEdit() {
    setDetailsValues(candidateToFormValues(candidateState));
    setDetailsError(null);
    setIsEditingDetails(true);
  }

  function cancelDetailsEdit() {
    setDetailsValues(candidateToFormValues(candidateState));
    setDetailsError(null);
    setIsEditingDetails(false);
  }

  function saveDetailsEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDetailsError(null);

    const validationError = validateCandidateFormValues(detailsValues);
    if (validationError) {
      setDetailsError(validationError);
      return;
    }

    startSavingDetails(async () => {
      try {
        const updatedCandidate = await replaceCandidateRecord(
          candidateState.id,
          formValuesToPayload(detailsValues),
        );

        updateCandidateState(updatedCandidate);
        setIsEditingDetails(false);
      } catch {
        setDetailsError("No se pudo actualizar el detalle. Intenta de nuevo.");
      }
    });
  }

  return (
    <section className="space-y-5">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="flex items-start gap-4">
            <CandidateAvatar name={candidateState.full_name} status={candidateState.status} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-black sm:text-3xl">
                  {candidateState.full_name}
                </h1>
                <ShieldCheck className="h-5 w-5 text-[#2170e4]" />
              </div>
              <p className="mt-1 text-base text-[#45464d]">{candidateState.position}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e4e2e4] px-2.5 py-0.5 text-xs font-medium text-[#45464d]">
                  <MapPin className="h-3.5 w-3.5" />
                  Sin ubicacion registrada
                </span>
                <StageBadge stage={candidateState.stage} />
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="space-y-5 xl:col-span-8">
            <section className="rounded-lg border border-[#c6c6cd] bg-white p-4 shadow-sm">
              <div className="relative flex items-start justify-between gap-2">
                <div className="absolute left-8 right-8 top-3.5 h-0.5 bg-[#c6c6cd]" />
                {steps.map((step, index) => {
                  const isDone = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  return (
                    <div key={step.stage} className="relative z-10 flex flex-1 flex-col items-center gap-1.5 bg-white px-2 text-center">
                      <span
                        className={[
                          "flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold",
                          isDone ? "border-[#0058be] bg-[#0058be] text-white" : "",
                          isCurrent ? "border-[#0058be] bg-white text-[#0058be]" : "",
                          !isDone && !isCurrent ? "border-[#c6c6cd] bg-white text-[#76777d]" : "",
                        ].join(" ")}
                        title={step.label}
                      >
                        {isDone ? "✓" : isCurrent ? "•" : ""}
                      </span>
                      <span className={`text-xs font-bold ${isCurrent ? "text-[#0058be]" : "text-[#45464d]"}`}>
                        {step.shortLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="overflow-hidden rounded-lg border border-[#c6c6cd] bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-[#c6c6cd] bg-[#f6f3f5] px-5 py-3.5">
                <h2 className="text-lg font-bold text-black">Detalle del candidato</h2>
                {isEditingDetails ? (
                  <button
                    type="button"
                    onClick={cancelDetailsEdit}
                    className="rounded-md border border-[#c6c6cd] bg-white px-3 py-1.5 text-xs font-bold text-black hover:bg-[#eee9ec] disabled:opacity-50"
                    disabled={isSavingDetails}
                  >
                    Cancelar
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <CandidateStatusStageControls
                      candidateId={candidateState.id}
                      status={candidateState.status}
                      stage={candidateState.stage}
                      onUpdated={updateCandidateState}
                    />
                    <button
                      type="button"
                      onClick={startDetailsEdit}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#c6c6cd] bg-white px-3 text-sm font-bold text-black hover:bg-[#eee9ec]"
                      aria-label="Editar detalle del candidato"
                      title="Editar detalle del candidato"
                    >
                      <Edit3 className="pointer-events-none h-4 w-4" />
                      Editar
                    </button>
                  </div>
                )}
              </div>
              {isEditingDetails ? (
                <form id="candidate-details-form" onSubmit={saveDetailsEdit}>
                  <div className="grid md:grid-cols-2">
                    <div className="space-y-4 border-[#c6c6cd] p-5 md:border-r">
                      <Detail label="Nombre">
                        <InlineInput
                          value={detailsValues.full_name}
                          onChange={(value) => handleDetailFieldChange("full_name", value)}
                          disabled={isSavingDetails}
                          autoFocus
                          required
                        />
                      </Detail>
                      <Detail label="Email">
                        <InlineInput
                          type="email"
                          value={detailsValues.email}
                          onChange={(value) => handleDetailFieldChange("email", value)}
                          disabled={isSavingDetails}
                          required
                        />
                      </Detail>
                      <Detail label="Telefono">
                        <InlineInput
                          value={detailsValues.phone}
                          onChange={(value) => handleDetailFieldChange("phone", value)}
                          disabled={isSavingDetails}
                          required
                        />
                      </Detail>
                      <Detail label="LinkedIn">
                        <InlineInput
                          type="url"
                          value={detailsValues.linkedin_url}
                          onChange={(value) => handleDetailFieldChange("linkedin_url", value)}
                          disabled={isSavingDetails}
                          placeholder="No disponible"
                        />
                      </Detail>
                      <Detail label="CV">
                        <InlineInput
                          type="url"
                          value={detailsValues.cv_url}
                          onChange={(value) => handleDetailFieldChange("cv_url", value)}
                          disabled={isSavingDetails}
                          required
                        />
                      </Detail>
                    </div>
                    <div className="space-y-4 p-5">
                      <Detail label="Puesto">
                        <InlineInput
                          value={detailsValues.position}
                          onChange={(value) => handleDetailFieldChange("position", value)}
                          disabled={isSavingDetails}
                          required
                        />
                      </Detail>
                      <Detail label="Estado">
                        <StatusBadge status={candidateState.status} />
                      </Detail>
                      <Detail label="Etapa">
                        <StageBadge stage={candidateState.stage} />
                      </Detail>
                      <Detail label="Anos de experiencia">
                        <InlineInput
                          type="number"
                          min={0}
                          value={detailsValues.experience_years}
                          onChange={(value) => handleDetailFieldChange("experience_years", value)}
                          disabled={isSavingDetails}
                          required
                        />
                      </Detail>
                      <Detail label="Fecha de aplicacion">{formatDate(candidateState.applied_at)}</Detail>
                      <Detail label="Ultima actualizacion">{formatDate(candidateState.updated_at)}</Detail>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t border-[#c6c6cd] px-5 py-3">
                    <button
                      type="button"
                      onClick={cancelDetailsEdit}
                      className="rounded-md border border-[#c6c6cd] bg-white px-3 py-2 text-xs font-bold text-black hover:bg-[#eee9ec] disabled:opacity-50"
                      disabled={isSavingDetails}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="rounded-md bg-[#0058be] px-3 py-2 text-xs font-bold text-white hover:bg-[#004395] disabled:opacity-50"
                      disabled={isSavingDetails}
                    >
                      {isSavingDetails ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                  {detailsError ? (
                    <p className="border-t border-[#c6c6cd] px-5 py-3 text-sm font-medium text-red-600">
                      {detailsError}
                    </p>
                  ) : null}
                </form>
              ) : (
                <div className="grid md:grid-cols-2">
                  <div className="space-y-4 border-[#c6c6cd] p-5 md:border-r">
                    <Detail label="Nombre">{candidateState.full_name}</Detail>
                    <Detail label="Email">
                      <a className="text-[#0058be] underline" href={`mailto:${candidateState.email}`}>
                        {candidateState.email}
                      </a>
                    </Detail>
                    <Detail label="Telefono">{candidateState.phone}</Detail>
                    <Detail label="LinkedIn">
                      {candidateState.linkedin_url ? (
                        <a className="break-all text-[#0058be] underline" href={candidateState.linkedin_url} target="_blank" rel="noreferrer">
                          {candidateState.linkedin_url}
                        </a>
                      ) : (
                        <span className="italic text-[#45464d]">No disponible</span>
                      )}
                    </Detail>
                    <Detail label="CV">
                      <a className="inline-flex items-center gap-2 font-bold text-[#0058be]" href={candidateState.cv_url} target="_blank" rel="noreferrer">
                        <FileText className="h-4 w-4" />
                        Ver CV
                      </a>
                    </Detail>
                  </div>
                  <div className="space-y-4 p-5">
                    <Detail label="Puesto">{candidateState.position}</Detail>
                    <Detail label="Estado">
                      <StatusBadge status={candidateState.status} />
                    </Detail>
                    <Detail label="Etapa">
                      <StageBadge stage={candidateState.stage} />
                    </Detail>
                    <Detail label="Anos de experiencia">{candidateState.experience_years}</Detail>
                    <Detail label="Fecha de aplicacion">{formatDate(candidateState.applied_at)}</Detail>
                    <Detail label="Ultima actualizacion">{formatDate(candidateState.updated_at)}</Detail>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-lg border border-[#c6c6cd] bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-black">Habilidades clave</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {[candidateState.position, `${candidateState.experience_years} anos exp.`, STAGE_LABELS[candidateState.stage]].map((item) => (
                  <span key={item} className="rounded-md bg-[#d8e2ff] px-3 py-1.5 text-xs font-bold text-[#001a42]">
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5 xl:col-span-4">
            <CandidateNotesSection
              candidateId={candidateState.id}
              notes={notes}
              notesCount={candidateState.notes_count}
              onNotesCountChange={handleNotesCountChange}
            />
          </aside>
        </div>
      </section>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[#45464d]">{label}</dt>
      <dd className="mt-1.5 text-sm font-medium text-black">{children}</dd>
    </div>
  );
}

function InlineInput({
  value,
  onChange,
  disabled,
  placeholder,
  required,
  type = "text",
  min,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  type?: "email" | "number" | "text" | "url";
  min?: number;
  autoFocus?: boolean;
}) {
  return (
    <input
      className="w-full rounded-md border border-transparent bg-[#f6f3f5] px-2 py-1.5 text-sm font-medium text-black outline-none transition focus:border-[#0058be] focus:bg-white disabled:opacity-60"
      type={type}
      min={min}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      required={required}
      autoFocus={autoFocus}
    />
  );
}
