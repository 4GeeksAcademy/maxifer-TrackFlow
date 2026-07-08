import { formatDate } from "@/lib/candidates";

type CandidateNoteItemProps = {
  id: string;
  content: string;
  createdAt: string;
  onDelete: (noteId: string) => void;
  disabled?: boolean;
};

export function CandidateNoteItem({
  id,
  content,
  createdAt,
  onDelete,
  disabled,
}: CandidateNoteItemProps) {
  return (
    <li className="rounded-md border border-zinc-200 p-3">
      <p className="text-sm text-zinc-900">{content}</p>
      <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
        <span>{formatDate(createdAt)}</span>
        <button
          type="button"
          className="font-medium text-red-600 disabled:opacity-50"
          onClick={() => onDelete(id)}
          disabled={disabled}
        >
          Eliminar
        </button>
      </div>
    </li>
  );
}
