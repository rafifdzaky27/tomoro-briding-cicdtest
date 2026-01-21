"use client";

import { useEffect, useMemo, useState } from "react";

type Yatim = { id: string; nama: string };
type Barang = { id: string; kode_barang: number | null; nama_utama: string };

type RowState = {
  mode: "match" | "new";
  accurateId: string;
  kodeBarang: string; // untuk mode new
};

export default function SetupAccurateClient() {
  const [loading, setLoading] = useState(true);
  const [yatim, setYatim] = useState<Yatim[]>([]);
  const [barang, setBarang] = useState<Barang[]>([]);
  const [q, setQ] = useState("");

  const [rowsState, setRowsState] = useState<Record<string, RowState>>({});
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const filteredBarang = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return barang;
    return barang.filter((b) =>
      `${b.kode_barang ?? ""} ${b.nama_utama}`.toLowerCase().includes(qq)
    );
  }, [barang, q]);

  const refresh = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const [a, b] = await Promise.all([
        fetch("/api/accurate/barang-yatim", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/accurate/barang", { cache: "no-store" }).then((r) => r.json()),
      ]);

      setYatim(a?.data ?? []);
      setBarang(b?.data ?? []);
      setRowsState((prev) => {
        const next: Record<string, RowState> = { ...prev };
        for (const y of a?.data ?? []) {
          if (!next[y.id]) next[y.id] = { mode: "match", accurateId: "", kodeBarang: "" };
        }
        return next;
      });
    } catch (e: any) {
      setMsg({ type: "err", text: e?.message ?? "Gagal load data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setState = (id: string, patch: Partial<RowState>) => {
    setRowsState((s) => ({ ...s, [id]: { ...s[id], ...patch } }));
  };

  const resolveOne = async (y: Yatim) => {
    setMsg(null);
    const st = rowsState[y.id];
    if (!st) return;

    if (st.mode === "match" && !st.accurateId) {
      setMsg({ type: "err", text: `Pilih Accurate Barang untuk "${y.nama}".` });
      return;
    }

    if (st.mode === "new") {
      if (!st.kodeBarang.trim()) {
        setMsg({ type: "err", text: `Isi kode barang untuk "${y.nama}".` });
        return;
      }
      if (!/^\d+$/.test(st.kodeBarang.trim())) {
        setMsg({ type: "err", text: `Kode barang harus angka (BIGINT) untuk "${y.nama}".` });
        return;
      }
    }

    try {
      const res = await fetch("/api/accurate/resolve-yatim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yatimId: y.id,
          mode: st.mode,
          accurateId: st.mode === "match" ? st.accurateId : null,
          kodeBarang: st.mode === "new" ? Number(st.kodeBarang) : null,
        }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body?.message ?? "Gagal menyimpan");

      // remove dari list (karena sudah masuk accurate_barang dan dihapus dari yatim)
      setYatim((prev) => prev.filter((x) => x.id !== y.id));
      setMsg({ type: "ok", text: `Berhasil memproses: ${y.nama}` });

      // refresh list accurate_barang biar dropdown up to date
      const b = await fetch("/api/accurate/barang", { cache: "no-store" }).then((r) => r.json());
      setBarang(b?.data ?? []);
    } catch (e: any) {
      setMsg({ type: "err", text: e?.message ?? "Error" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">Setup Accurate</div>
            <div className="text-xs text-slate-500">
              Data di <code>accurate_barang_yatim</code> harus dimapping ke <code>accurate_barang</code>.
              Setelah tersimpan, data yatim akan dihapus.
            </div>
          </div>

          <button
            type="button"
            onClick={refresh}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {msg ? (
          <div
            className={`mt-3 rounded-md border px-3 py-2 text-sm ${
              msg.type === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {msg.text}
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-semibold">
            Accurate Barang Yatim ({loading ? "..." : yatim.length})
          </div>

          <div className="flex w-full gap-2 md:w-auto">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari accurate barang (kode/nama)..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 md:w-80"
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-3 text-sm text-slate-500">Loading...</div>
        ) : yatim.length === 0 ? (
          <div className="mt-3 text-sm text-slate-500">Tidak ada barang yatim 🎉</div>
        ) : (
          <div className="mt-4 overflow-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border-b px-3 py-2 text-left text-xs font-semibold text-slate-600">
                    Nama (Yatim)
                  </th>
                  <th className="border-b px-3 py-2 text-left text-xs font-semibold text-slate-600">
                    Aksi
                  </th>
                  <th className="border-b px-3 py-2 text-left text-xs font-semibold text-slate-600">
                    Target / Kode Barang
                  </th>
                  <th className="border-b px-3 py-2"></th>
                </tr>
              </thead>

              <tbody>
                {yatim.map((y) => {
                  const st = rowsState[y.id] ?? { mode: "match", accurateId: "", kodeBarang: "" };
                  return (
                    <tr key={y.id} className="border-b border-slate-100">
                      <td className="px-3 py-2 font-medium text-slate-800">{y.nama}</td>

                      <td className="px-3 py-2">
                        <select
                          className="w-48 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                          value={st.mode}
                          onChange={(e) => setState(y.id, { mode: e.target.value as any })}
                        >
                          <option value="match">Cocokkan ke barang existing</option>
                          <option value="new">Tambah barang baru</option>
                        </select>
                      </td>

                      <td className="px-3 py-2">
                        {st.mode === "match" ? (
                          <select
                            className="w-[520px] max-w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                            value={st.accurateId}
                            onChange={(e) => setState(y.id, { accurateId: e.target.value })}
                          >
                            <option value="">-- pilih accurate_barang --</option>
                            {filteredBarang.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.kode_barang ?? "-"} — {b.nama_utama}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm"
                            value={st.kodeBarang}
                            onChange={(e) => setState(y.id, { kodeBarang: e.target.value })}
                            placeholder="Masukkan kode barang (BIGINT)"
                          />
                        )}
                      </td>

                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => resolveOne(y)}
                          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white"
                        >
                          Simpan
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-3 text-xs text-slate-500">
              Catatan: saat “Cocokkan”, nama yatim akan ditambahkan ke <code>accurate_barang.nama</code> (JSONB array),
              lalu record yatim dihapus.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
