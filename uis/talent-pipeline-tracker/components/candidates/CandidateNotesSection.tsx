"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CandidateNote, createCandidateNote, deleteCandidateNote } from "@/lib/candidates";
import { CandidateNoteItem } from "@/components/candidates/CandidateNoteItem";

type CandidateNotesSectionProps = {
  candidateId: string;
  notes: CandidateNote[];
};

export function CandidateNotesSection({ candidateId, notes }: CandidateNotesSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  function handleCreateNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setError("La nota no puede estar vacía.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createCandidateNote(candidateId, trimmed);
        setContent("");
        router.refresh();
      } catch {
        setError("No se pudo guardar la nota. Intenta de nuevo.");
      }
    });
  }
  function handleDeleteNote(noteId: string) {
    setError(null);
    startTransition(async () => {
      try {
        await deleteCandidateNote(candidateId, noteId);
        router.refresh();
      } catch {
        setError("No se pudo eliminar la nota. Intenta de nuevo.");
      }
    });
  }
  return (
    <section className="mt-6 rounded-lg border border-zinc-200 p-4">
      <h2 className="text-sm font-semibold text-zinc-900">Notas internas</h2>
      <form onSubmit={handleCreateNote} className="mt-3 flex flex-col gap-3">
        <textarea
          className="min-h-24 rounded-md border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Escribe una nota sobre la candidatura"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          disabled={isPending}
        />
        <button
          type="submit"
          className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          disabled={isPending}
        >
          Añadir nota
        </button>
      </form>
      <ul className="mt-4 space-y-3">
        {notes.map((note) => (
          <CandidateNoteItem
            key={note.id}
            id={note.id}
            content={note.content}
            createdAt={note.created_at}
            onDelete={handleDeleteNote}
            disabled={isPending}
          />
        ))}
      </ul>
      {!notes.length ? <p className="mt-4 text-sm text-zinc-500">Aun no hay notas.</p> : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
