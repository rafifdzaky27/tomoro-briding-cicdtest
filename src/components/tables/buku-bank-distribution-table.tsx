// src/components/buku-bank/BukuBankDistributionTable.tsx
import type { CrDbDistribution } from "@/types/bukuBank";

type Props = {
  distribusi: CrDbDistribution[];
};

const idNumber = new Intl.NumberFormat("id-ID");

export function BukuBankDistributionTable({ distribusi }: Props) {
  const hasData = Array.isArray(distribusi) && distribusi.length > 0;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-700">
        Distribusi nominal Kredit / Debit
      </h2>

      <div className="max-w-md overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="min-w-full text-left text-xs">
          <thead className="border-b bg-slate-50 text-[11px] uppercase">
            <tr>
              <th className="px-3 py-2">CR / DB</th>
              <th className="px-3 py-2 text-right">TOTAL NOMINAL</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {hasData ? (
              distribusi.map((item, idx) => {
                const label = item?.cr_db ?? "-";
                const total = Number(item?.total_nominal ?? 0);

                return (
                  <tr key={`${label}-${idx}`}>
                    <td className="px-3 py-1.5">{label}</td>
                    <td className="px-3 py-1.5 text-right">
                      {idNumber.format(Number.isFinite(total) ? total : 0)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={2}
                  className="px-3 py-3 text-center text-xs text-slate-500"
                >
                  Tidak ada data distribusi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
