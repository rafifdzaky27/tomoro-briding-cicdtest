// src/components/edit-value/sales-edit-panel.tsx
import { SummaryCard } from "@/components/cards/sales-summary-card";
import type { SalesRow } from "@/types/sales";

type SalesEditPanelProps = {
  selected: SalesRow | null;
  newCabang: string;
  newChannel: string;
  newDiterima: string;                 // 👈 baru
  onChangeCabang: (value: string) => void;
  onChangeChannel: (value: string) => void;
  onChangeDiterima: (value: string) => void; // 👈 baru
  onSave: () => void;
  saving: boolean;
};

export function SalesEditPanel({
  selected,
  newCabang,
  newChannel,
  newDiterima,
  onChangeCabang,
  onChangeChannel,
  onChangeDiterima,
  onSave,
  saving,
}: SalesEditPanelProps) {
  if (!selected) return null;

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <SummaryCard
        label="Row terpilih"
        value={`${selected.cabang ?? "-"} • ${selected.channel ?? "-"}`}
        helper={`${selected.diterima ?? "-"} • ${
          selected.keterangan ?? "Tanpa keterangan"
        }`}
      />

      <div className="rounded-xl border bg-white p-4 shadow-sm space-y-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Cabang</label>
          <input
            value={newCabang}
            onChange={(e) => onChangeCabang(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Channel</label>
          <input
            value={newChannel}
            onChange={(e) => onChangeChannel(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Diterima
          </label>
          <input
            value={newDiterima}
            onChange={(e) => onChangeDiterima(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
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
