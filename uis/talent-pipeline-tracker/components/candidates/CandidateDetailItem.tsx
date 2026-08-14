import { ReactNode } from "react";

type CandidateDetailItemProps = {
  label: string;
  children: ReactNode;
  fullWidth?: boolean;
};

export function CandidateDetailItem({ label, children, fullWidth }: CandidateDetailItemProps) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : undefined}>
      <dt className="font-medium text-zinc-500">{label}</dt>
      <dd className="mt-1 text-zinc-900">{children}</dd>
    </div>
  );
}