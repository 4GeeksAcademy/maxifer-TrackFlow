"use client";

import { Plus } from "lucide-react";
import { CandidateNoteItem } from "@/components/candidates/CandidateNoteItem";
import { useCandidateNotes } from "@/hooks/use-candidate-notes";
import type { CandidateNote } from "@/types/candidates";

type CandidateNotesSectionProps = {
  candidateId: string;
  notes: CandidateNote[];
  notesCount: number;
  onNotesCountChange?: (count: number) => void;
};

export function CandidateNotesSection({
  candidateId,
  notes,
  notesCount,
  onNotesCountChange,
}: CandidateNotesSectionProps) {
  const {
    isPending,
    notes: notesState,
    content,
    error,
    success,
    setContent,
    handleCreateNote,
    handleDeleteNote,
  } = useCandidateNotes({
    candidateId,
    initialNotes: notes,
    onNotesCountChange,
  });

  return (
    <section className="overflow-hidden rounded-lg border border-[#c6c6cd] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#c6c6cd] px-4 py-3">
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-black">Notas internas</h2>
        <span className="rounded bg-[#e4e2e4] px-2 py-1 text-[10px] font-black uppercase text-[#45464d]">
          {notesCount} {notesCount === 1 ? "nota" : "notas"}
        </span>
      </div>
      <div className="space-y-4 p-4">
        <ul className="space-y-3">
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
        {!notesState.length ? (
          <p className="rounded-lg bg-[#f6f3f5] p-4 text-sm text-[#45464d]">Aún no hay notas.</p>
        ) : null}
        <form onSubmit={handleCreateNote} className="space-y-3">
          <textarea
            className="min-h-20 w-full resize-none rounded-lg border border-[#c6c6cd] bg-[#fcf8fa] px-3 py-2.5 text-sm text-[#1b1b1d]"
            placeholder="Añadir una observación..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
            disabled={isPending}
          />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#0058be] px-4 py-2.5 text-sm font-bold text-[#0058be] hover:bg-blue-50 disabled:opacity-50"
            disabled={isPending}
          >
            <Plus className="h-5 w-5" />
            {isPending ? "Procesando..." : "Añadir nota"}
          </button>
        </form>
        {success ? <p className="text-sm font-medium text-emerald-700">{success}</p> : null}
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      </div>
    </section>
  );
}
