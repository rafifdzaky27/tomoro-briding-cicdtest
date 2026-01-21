// src/components/tables/rekonsiliasi-table.tsx
"use client";

import Link from "next/link";
import {
  StatusBadge,
  type RekonsiliasiStatus,
} from "@/components/badges/rekonsiliasi-status-badge";

export type RekonsiliasiRow = {
  id: number;
  bank_record: string | null;
  nominal: number | null;
  channel: string | null;
  cabang: string | null;
  link: string | null;
  status: RekonsiliasiStatus;
  created_at: string;
};

type RekonsiliasiTableProps = {
  rows: RekonsiliasiRow[];
  onPreviewLink?: (url: string) => void; // 🔹 callback ke parent
};

export function RekonsiliasiTable({ rows, onPreviewLink }: RekonsiliasiTableProps) {
  return (
    <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-2">BANK RECORD</th>
            <th className="px-4 py-2">NOMINAL</th>
            <th className="px-4 py-2 min-w-[140px]">CHANNEL</th>
            <th className="px-4 py-2">CABANG</th>
            <th className="px-4 py-2">STATUS</th>
            <th className="px-4 py-2 text-right">ACTION</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-6 text-center text-sm text-slate-500"
              >
                Tidak ada data untuk filter ini.
              </td>
            </tr>
          )}

          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50/60">
              <td className="px-4 py-2">{row.bank_record ?? "-"}</td>
              <td className="px-4 py-2">
                {row.nominal !== null
                  ? row.nominal.toLocaleString("id-ID")
                  : "-"}
              </td>
              <td className="px-4 py-2 min-w-[140px]">
                {row.channel ?? "-"}
              </td>
              <td className="px-4 py-2">{row.cabang ?? "-"}</td>

              <td className="px-4 py-2">
                <StatusBadge status={row.status} />
              </td>

              <td className="px-4 py-2 text-right">
                <Link
                  href={`/rekonsiliasi/${row.id}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100"
                >
                  <span className="sr-only">Lihat detail</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 4.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L10.586 10 7.293 6.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
