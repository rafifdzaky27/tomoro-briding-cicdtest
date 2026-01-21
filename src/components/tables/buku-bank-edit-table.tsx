// src/components/edit-value/buku-bank-table.tsx
import type { BukuBankRow } from "@/types/bukuBank";

type BukuBankTableProps = {
  rows: BukuBankRow[];
  onEdit: (row: BukuBankRow) => void;
  emptyMessage: string;
};

export function BukuBankTable({
  rows,
  onEdit,
  emptyMessage,
}: BukuBankTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="min-w-full text-left text-xs">
        <thead className="border-b bg-slate-50 text-[11px] uppercase">
          <tr>
            <th className="px-3 py-2">ID</th>
            <th className="px-3 py-2">DATE</th>
            <th className="px-3 py-2">BANK RECORD</th>
            <th className="px-3 py-2">CABANG</th>
            <th className="px-3 py-2">DITERIMA / DIBAYAR</th>
            <th className="px-3 py-2">CR / DB</th>
            <th className="px-3 py-2">KETERANGAN</th>
            <th className="px-3 py-2 text-right">NOMINAL</th>
            <th className="px-3 py-2 text-right">SALDO</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              <td className="px-3 py-1.5">{row.id}</td>
              <td className="px-3 py-1.5">{row.date ?? "-"}</td>
              <td className="px-3 py-1.5 max-w-xs truncate">
                {row.bank_record}
              </td>
              <td className="px-3 py-1.5">{row.cabang ?? "-"}</td>
              <td className="px-3 py-1.5 max-w-xs truncate">
                {row.diterima_dibayar ?? "-"}
              </td>
              <td className="px-3 py-1.5">{row.cr_db ?? "-"}</td>
              <td className="px-3 py-1.5 max-w-xs truncate">
                {row.keterangan}
              </td>
              <td className="px-3 py-1.5 text-right">
                {(row.nominal ?? 0).toLocaleString("id-ID")}
              </td>
              <td className="px-3 py-1.5 text-right">
                {(row.saldo ?? 0).toLocaleString("id-ID")}
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
                colSpan={10}
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
