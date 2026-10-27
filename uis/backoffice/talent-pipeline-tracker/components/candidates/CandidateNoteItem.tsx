import { Trash2 } from "lucide-react";
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
    <li className="rounded-lg border-l-4 border-[#0058be] bg-[#f6f3f5] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-black">{content}</p>
          <p className="mt-2 text-xs text-[#45464d]/70">{formatDate(createdAt)}</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
          onClick={() => onDelete(id)}
          disabled={disabled}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar
        </button>
      </div>
    </li>
  );
}
