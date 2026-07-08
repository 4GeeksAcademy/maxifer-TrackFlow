"use client";

import { CandidateNote } from "@/lib/candidates";
import { CandidateNoteItem } from "@/components/candidates/CandidateNoteItem";
import { useCandidateNotes } from "@/lib/use-candidate-notes";

type CandidateNotesSectionProps = {
  candidateId: string;
  notes: CandidateNote[];
  onNotesCountChange?: (count: number) => void;
};

export function CandidateNotesSection({
  candidateId,
  notes,
  onNotesCountChange,
}: CandidateNotesSectionProps) {
  const { isPending, notes: notesState, content, error, success, setContent, handleCreateNote, handleDeleteNote } =
    useCandidateNotes({
      candidateId,
      initialNotes: notes,
      onNotesCountChange,
    });

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
        {notesState.map((note) => (
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
      {!notesState.length ? <p className="mt-4 text-sm text-zinc-500">Aun no hay notas.</p> : null}
      {isPending ? <p className="mt-3 text-sm text-zinc-600">Procesando cambios...</p> : null}
      {success ? <p className="mt-3 text-sm text-emerald-700">{success}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
