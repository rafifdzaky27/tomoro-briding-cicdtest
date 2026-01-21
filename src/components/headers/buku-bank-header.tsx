// src/components/buku-bank/BukuBankHeader.tsx

type BukuBankHeaderProps = {
  month: string; // format YYYY-MM
  onMonthChange: (value: string) => void;
  jumlahTransaksi: number;
  profit: number;
};

const idNumber = new Intl.NumberFormat("id-ID");

function formatMonthLabel(month: string) {
  // month: "YYYY-MM"
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return "";

  const y = Number(match[1]);
  const m = Number(match[2]);

  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) return "";

  const date = new Date(y, m - 1, 1);
  return date.toLocaleDateString("id-ID", { year: "numeric", month: "long" });
}

export function BukuBankHeader({
  month,
  onMonthChange,
  jumlahTransaksi,
  profit,
}: BukuBankHeaderProps) {
  const formattedMonthLabel = formatMonthLabel(month);

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {/* Periode */}
      <div className="space-y-2 rounded-xl border bg-white p-4 shadow-sm md:col-span-1">
        <div className="text-xs font-semibold uppercase text-slate-500">
          Periode
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
        />
        <p className="text-[11px] text-slate-500">
          Menampilkan transaksi berdasarkan kolom{" "}
          <span className="font-mono">date</span>.
        </p>
      </div>

      {/* Info Bulan */}
      <div className="space-y-1 rounded-xl border bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase text-slate-500">
          Bulan
        </div>
        <div className="text-sm font-semibold text-slate-900">
          {formattedMonthLabel || "-"}
        </div>
        <div className="mt-2 text-xs text-slate-500">
          {jumlahTransaksi} transaksi
        </div>
      </div>

      {/* Ringkasan / Profit */}
      <div className="space-y-2 rounded-xl border bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase text-slate-500">
          Ringkasan
        </div>
        <div className="text-sm text-slate-700">
          Profit (Debit - Kredit):{" "}
          <span className="font-semibold">{idNumber.format(profit)}</span>
        </div>
      </div>
    </section>
  );
}
