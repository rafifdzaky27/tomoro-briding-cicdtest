// src/components/tables/sales-tomoro-table.tsx

export type SalesRow = {
  id: number | string;
  date: string | null;              // tetap disimpan untuk backend, tidak ditampilkan
  transaction_date: string | null;
  keterangan: string | null;
  cabang: string | null;
  jumlah: number | string | null;
  channel: string | null;
  diterima: string | null;
};

type SalesTomoroTableProps = {
  rows: SalesRow[];
  loading: boolean;
  errorMsg: string | null;
};

const formatJumlah = (value: number | string | null) => {
  if (value === null || value === undefined) return "";
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return String(value ?? "");
  return num.toLocaleString("id-ID", { maximumFractionDigits: 0 });
};

export function SalesTomoroTable({
  rows,
  loading,
  errorMsg,
}: SalesTomoroTableProps) {
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">
          Tabel sales_tomoro
        </h2>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          {!loading && (
            <span>{rows.length.toLocaleString("id-ID")} baris ditampilkan</span>
          )}
          {loading && <span>Memuat data sales…</span>}
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="mt-3 overflow-auto rounded-md border border-slate-200">
        <table className="min-w-full border-collapse text-xs">
          <thead className="bg-slate-50">
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="border-b border-slate-200 px-3 py-2">
                Tanggal Transaksi
              </th>
              <th className="border-b border-slate-200 px-3 py-2">Keterangan</th>
              <th className="border-b border-slate-200 px-3 py-2">Cabang</th>
              <th className="border-b border-slate-200 px-3 py-2 text-right">
                Jumlah
              </th>
              <th className="border-b border-slate-200 px-3 py-2">Channel</th>
              <th className="border-b border-slate-200 px-3 py-2">Diterima</th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-4 text-center text-[11px] text-slate-400"
                >
                  Belum ada data sales_tomoro untuk periode ini.
                </td>
              </tr>
            )}

            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-slate-100 odd:bg-white even:bg-slate-50/50"
              >
                <td className="px-3 py-2 align-top">
                  {row.transaction_date ?? "-"}
                </td>
                <td className="px-3 py-2 align-top text-slate-700">
                  {row.keterangan ?? "-"}
                </td>
                <td className="px-3 py-2 align-top">{row.cabang ?? "-"}</td>
                <td className="px-3 py-2 align-top text-right font-mono">
                  {formatJumlah(row.jumlah)}
                </td>
                <td className="px-3 py-2 align-top">{row.channel ?? "-"}</td>
                <td className="px-3 py-2 align-top">{row.diterima ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-[11px] text-slate-400">
        *Kolom yang ditampilkan saat ini:{" "}
        <code>transaction_date</code>, <code>keterangan</code>,{" "}
        <code>cabang</code>, <code>jumlah</code>, <code>channel</code>,{" "}
        <code>diterima</code>. Kolom ID dan metadata seperti{" "}
        <code>created_at</code> tidak ditampilkan.
      </p>
    </section>
  );
}