import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function BackToCandidatesLink() {
  return (
    <Link
      href="/"
      className="mb-6 inline-flex w-fit items-center gap-1 text-sm font-bold text-[#0058be] hover:underline"
    >
      <ChevronLeft className="h-4 w-4" />
      Volver al pipeline
    </Link>
  );
}
