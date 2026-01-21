// src/components/buku-bank/BukuBankDataTable.tsx
import type { BukuBankRow } from "@/types/bukuBank";

type Props = {
  rows: BukuBankRow[];
  loading: boolean;
};

export function BukuBankDataTable({ rows, loading }: Props) {
  const handleExportExcel = async () => {
    if (!rows.length) return;

    const XLSX = await import("xlsx");

    // Data mentah untuk Excel (tanpa format titik/koma)
    const dataForExcel = rows.map((row) => ({
      DATE: row.date ?? "",
      "BANK RECORD": row.bank_record ?? "",
      CABANG: row.cabang ?? "",
      KETERANGAN: row.keterangan ?? "",
      "CR / DB": row.cr_db ?? "",
      "DITERIMA / DIBAYAR": row.diterima_dibayar ?? "",
      NOMINAL: row.nominal ?? 0, // angka murni
      SALDO: row.saldo ?? 0,     // angka murni
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Buku Bank");

    const wbout = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `buku-bank-${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">
          Data transaksi buku bank
        </h2>

        <button
          type="button"
          onClick={handleExportExcel}
          disabled={!rows.length || loading}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export Excel
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Loading data...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="min-w-full text-left text-xs">
            <thead className="border-b bg-slate-50 text-[11px] uppercase">
              <tr>
                <th className="px-3 py-2">DATE</th>
                <th className="px-3 py-2">BANK RECORD</th>
                <th className="px-3 py-2">CABANG</th>
                <th className="px-3 py-2">KETERANGAN</th>
                <th className="px-3 py-2">CR / DB</th>
                <th className="px-3 py-2">DITERIMA / DIBAYAR</th>
                <th className="px-3 py-2 text-right">NOMINAL</th>
                <th className="px-3 py-2 text-right">SALDO</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-3 py-1.5">{row.date ?? "-"}</td>
                  <td className="px-3 py-1.5 max-w-xs truncate">
                    {row.bank_record}
                  </td>
                  <td className="px-3 py-1.5">{row.cabang ?? "-"}</td>
                  <td className="px-3 py-1.5 max-w-xs truncate">
                    {row.keterangan}
                  </td>
                  <td className="px-3 py-1.5">{row.cr_db ?? "-"}</td>
                  <td className="px-3 py-1.5 max-w-xs truncate">
                    {row.diterima_dibayar ?? "-"}
                  </td>

                  {/* 🔹 Di web pakai format id-ID (ada titik) */}
                  <td className="px-3 py-1.5 text-right">
                    {(row.nominal ?? 0).toLocaleString("id-ID")}
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    {(row.saldo ?? 0).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}

              {rows.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-3 text-center text-xs text-slate-500"
                  >
                    Tidak ada transaksi pada bulan ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
