"use client";

import { FormEvent, useState, useTransition } from "react";
import { createCandidateNote, deleteCandidateNote } from "@/lib/candidates";
import { CandidateNote } from "@/types/candidates";

type UseCandidateNotesParams = {
  candidateId: string;
  initialNotes: CandidateNote[];
  onNotesCountChange?: (count: number) => void;
};

export function useCandidateNotes({
  candidateId,
  initialNotes,
  onNotesCountChange,
}: UseCandidateNotesParams) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(initialNotes);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function updateNotes(updater: (current: CandidateNote[]) => CandidateNote[]) {
    setNotes((current) => {
      const nextNotes = updater(current);
      onNotesCountChange?.(nextNotes.length);
      return nextNotes;
    });
  }

  function handleCreateNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setError("La nota no puede estar vacía.");
      return;
    }

    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const createdNote = await createCandidateNote(candidateId, trimmed);
        updateNotes((current) => [createdNote, ...current]);
        setContent("");
        setSuccess("Nota guardada correctamente.");
      } catch {
        setError("No se pudo guardar la nota. Intenta de nuevo.");
      }
    });
  }

  function handleDeleteNote(noteId: string) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        await deleteCandidateNote(candidateId, noteId);
        updateNotes((current) => current.filter((note) => note.id !== noteId));
        setSuccess("Nota eliminada correctamente.");
      } catch {
        setError("No se pudo eliminar la nota. Intenta de nuevo.");
      }
    });
  }

  return {
    isPending,
    notes,
    content,
    error,
    success,
    setContent,
    handleCreateNote,
    handleDeleteNote,
  };
}
