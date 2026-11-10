"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { branches, branchLabels, categories, createIncident, IncidentApiError, origins, statuses } from "@/lib/incidents";
import type { IncidentInput } from "@/lib/incidents";
const initialForm: IncidentInput = { title: "", description: "", category: "carrier_issue", status: "open", origin: "internal", branch: "central" };
const fieldLabels: Record<string, string> = { title: "Título", description: "Descripción", category: "Categoría", status: "Estado", origin: "Origen", branch: "Sede" };
const label = (key: string) => branchLabels[key] || key.replaceAll("_", " ");

export default function IncidentCreateDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (message: string) => void }) {
  const [form, setForm] = useState<IncidentInput>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formMessage, setFormMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const trigger = document.getElementById("new-incident");
    dialogRef.current?.showModal();
    return () => { trigger?.focus(); };
  }, []);
  function closeDialog() {
    dialogRef.current?.close();
    onClose();
    if (window.location.hash === "#new-incident") history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  function handleDialogClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors: Record<string, string> = {};
    for (const field of ["title", "description", "category", "status", "origin", "branch"] as const) {
      if (!form[field].trim()) errors[field] = `${fieldLabels[field]} es obligatorio`;
    }
    if (form.title.length > 120) errors.title = "El título no puede superar 120 caracteres";
    setFieldErrors(errors); setFormMessage("");
    if (Object.keys(errors).length) return;
    setSaving(true);
    try {
      await createIncident(form);

      setForm(initialForm); setFieldErrors({}); setFormMessage("Incidencia creada correctamente.");
      closeDialog();
      onCreated("Incidencia creada correctamente.");
    } catch (error) {
      if (error instanceof IncidentApiError && error.field && error.field in form) setFieldErrors({ [error.field]: error.message });
      else setFormMessage(error instanceof Error ? error.message : "No se pudo crear la incidencia.");
    } finally { setSaving(false); }
  }

  return (
<dialog ref={dialogRef} className="incidentDialog" aria-labelledby="incident-dialog-title" onClick={handleDialogClick} onCancel={event => { event.preventDefault(); closeDialog(); }} onClose={() => { if (window.location.hash === "#new-incident") history.replaceState(null, "", window.location.pathname + window.location.search); }}>
      <div className="incidentDialogHeader"><h2 id="incident-dialog-title">Registro rápido de incidencia</h2><button type="button" className="incidentDialogClose" aria-label="Cerrar formulario" onClick={closeDialog}>×</button></div>
      <form className="incidentForm" onSubmit={submit} noValidate>
        {(["title", "description"] as const).map(field => <label key={field} className={field === "description" ? "incidentWide" : ""}>{fieldLabels[field]}
          {field === "description" ? <textarea value={form[field]} onChange={event => setForm({ ...form, [field]: event.target.value })} aria-invalid={!!fieldErrors[field]} /> : <input value={form[field]} onChange={event => setForm({ ...form, [field]: event.target.value })} maxLength={121} aria-invalid={!!fieldErrors[field]} />}
          {fieldErrors[field] && <small className="fieldError">{fieldErrors[field]}</small>}
        </label>)}
        {(["category", "status", "origin", "branch"] as const).map(field => <label key={field} className={field === "branch" && form.origin === "branch" ? "branchRequired" : ""}>{fieldLabels[field]}
          <select value={form[field]} onChange={event => setForm({ ...form, [field]: event.target.value })} aria-invalid={!!fieldErrors[field]}>
            {(field === "category" ? categories : field === "status" ? statuses : field === "origin" ? origins : branches).map(value => <option key={value} value={value}>{label(value)}</option>)}
          </select>{fieldErrors[field] && <small className="fieldError">{fieldErrors[field]}</small>}
        </label>)}
        <div className="incidentWide flex flex-wrap gap-2"><button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar incidencia"}</button><button type="button" className="button secondaryButton" onClick={() => { setForm(initialForm); setFieldErrors({}); setFormMessage(""); }}>Limpiar formulario</button><button type="button" className="button secondaryButton" onClick={closeDialog}>Cancelar</button></div>
      </form>{formMessage && !formMessage.includes("correctamente") && <p role="alert" className="error">{formMessage}</p>}
    </dialog>
  );
}
