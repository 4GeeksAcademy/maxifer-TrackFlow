import Link from "next/link";

export function BackToCandidatesLink() {
  return (
    <div className="mb-6">
      <Link
        href="/"
        className="text-sm font-medium text-zinc-700 underline-offset-2 hover:underline"
      >
        Volver al pipeline de TrackFlow
      </Link>
    </div>
  );
}
