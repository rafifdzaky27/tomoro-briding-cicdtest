// src/components/edit-value/buku-bank-edit-panel.tsx
import { SummaryCard } from "@/components/cards/sales-summary-card";
import type { BukuBankRow } from "@/types/bukuBank";

type BukuBankEditPanelProps = {
  selected: BukuBankRow | null;

  newCabang: string;
  onChangeCabang: (value: string) => void;

  newDiterimaDibayar: string;
  onChangeDiterimaDibayar: (value: string) => void;

  newKeterangan: string;
  onChangeKeterangan: (value: string) => void;

  onSave: () => void;
  saving: boolean;
};

export function BukuBankEditPanel({
  selected,
  newCabang,
  onChangeCabang,
  newDiterimaDibayar,
  onChangeDiterimaDibayar,
  newKeterangan,
  onChangeKeterangan,
  onSave,
  saving,
}: BukuBankEditPanelProps) {
  if (!selected) return null;

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <SummaryCard
        label="Row terpilih"
        value={`${selected.cabang ?? "-"} • ${
          selected.diterima_dibayar ?? "-"
        }`}
        helper={
          (selected.cr_db ?? "-") +
          " • " +
          (selected.bank_record ?? "-") +
          " • " +
          (selected.keterangan ?? "Tanpa keterangan")
        }
      />

      <div className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Cabang</label>
          <input
            value={newCabang}
            onChange={(e) => onChangeCabang(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Diterima / Dibayar
          </label>
          <input
            value={newDiterimaDibayar}
            onChange={(e) => onChangeDiterimaDibayar(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="misal: diterima, dibayar, unknown, ..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Keterangan
          </label>
          <textarea
            value={newKeterangan}
            onChange={(e) => onChangeKeterangan(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="mt-3 w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </section>
  );
}