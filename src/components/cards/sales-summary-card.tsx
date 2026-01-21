// src/app/(app)/components/cards/summary-card.tsx
"use client";

import type { ReactNode } from "react";

type SummaryCardProps = {
  label: string;
  value: string | ReactNode;
  helper?: string;
};

export function SummaryCard({ label, value, helper }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
      {helper && (
        <div className="mt-1 text-[11px] text-slate-500">{helper}</div>
      )}
    </div>
  );
}