// src/components/edit-value/sales-table.tsx
import type { SalesRow } from "@/types/sales";

type SalesTableProps = {
  rows: SalesRow[];
  onEdit: (row: SalesRow) => void;
  emptyMessage: string;
};

export function SalesTable({ rows, onEdit, emptyMessage }: SalesTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="min-w-full text-left text-xs">
        <thead className="border-b bg-slate-50 text-[11px] uppercase">
          <tr>
            <th className="px-3 py-2">DATE</th>
            <th className="px-3 py-2">DITERIMA</th> {/* 👈 baru */}
            <th className="px-3 py-2">CABANG</th>
            <th className="px-3 py-2">CHANNEL</th>
            <th className="px-3 py-2">KETERANGAN</th>
            <th className="px-3 py-2 text-right">JUMLAH</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              <td className="px-3 py-1.5">{row.date ?? "-"}</td>
              <td className="px-3 py-1.5">{row.diterima ?? "-"}</td> {/* 👈 baru */}
              <td className="px-3 py-1.5">{row.cabang ?? "-"}</td>
              <td className="px-3 py-1.5">{row.channel ?? "-"}</td>
              <td className="px-3 py-1.5 max-w-xs truncate">
                {row.keterangan}
              </td>
              <td className="px-3 py-1.5 text-right">
                {row.jumlah.toLocaleString("id-ID")}
              </td>
              <td className="px-3 py-1.5 text-right">
                <button
                  type="button"
                  onClick={() => onEdit(row)}
                  className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-slate-100"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-3 py-3 text-center text-xs text-slate-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}