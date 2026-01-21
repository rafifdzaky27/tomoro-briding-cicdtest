import type { ReactNode } from "react";

type DetailRowProps = {
  label: string;
  value: ReactNode;
};

export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex gap-4 border-b border-slate-100 pb-2 last:border-0">
      <div className="w-32 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="flex-1 text-sm text-slate-800">{value}</div>
    </div>
  );
}
