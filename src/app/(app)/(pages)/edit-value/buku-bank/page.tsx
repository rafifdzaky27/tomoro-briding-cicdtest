"use client";

import { useEffect, useState } from "react";
import { BukuBankTable } from "@/components/tables/buku-bank-edit-table";
import { BukuBankEditPanel } from "@/components/panels/buku-bank-edit-panel";
import { EditSearchBox } from "@/components/box/edit-search-box";
import type { BukuBankRow } from "@/types/bukuBank";

export default function EditBukuBankPage() {
  const [rowsToFix, setRowsToFix] = useState<BukuBankRow[]>([]);
  const [loadingRowsToFix, setLoadingRowsToFix] = useState(true);

  const [query, setQuery] = useState("");
  const [searchRows, setSearchRows] = useState<BukuBankRow[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [selected, setSelected] = useState<BukuBankRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [newCabang, setNewCabang] = useState("");
  const [newDiterimaDibayar, setNewDiterimaDibayar] = useState("");
  const [newKeterangan, setNewKeterangan] = useState("");

  // load rows to fix
  useEffect(() => {
    const controller = new AbortController();

    const loadRowsToFix = async () => {
      setLoadingRowsToFix(true);
      setMessage(null);

      try {
        const res = await fetch("/api/buku-bank/to-fix?limit=500", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const json: any = await res.json().catch(() => ({}));

        if (!res.ok) {
          setMessage(json?.message || "Gagal memuat data 'perlu dicek' dari buku bank.");
          setRowsToFix([]);
          return;
        }

        setRowsToFix((json?.data || []) as BukuBankRow[]);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error(err);
        setMessage(err?.message || "Gagal memuat data 'perlu dicek' dari buku bank.");
        setRowsToFix([]);
      } finally {
        setLoadingRowsToFix(false);
      }
    };

    void loadRowsToFix();
    return () => controller.abort();
  }, []);

  // search by keterangan
  const handleSearch = async () => {
    const q = query.trim();
    setSearchRows([]);
    setSelected(null);
    setNewCabang("");
    setMessage(null);

    if (!q) return;

    setLoadingSearch(true);

    try {
      const res = await fetch(
        `/api/buku-bank/search?q=${encodeURIComponent(q)}&limit=200`,
        { method: "GET", cache: "no-store" }
      );

      const json: any = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(json?.message || "Gagal melakukan pencarian di buku bank.");
        setSearchRows([]);
        return;
      }

      setSearchRows((json?.data || []) as BukuBankRow[]);
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message || "Gagal melakukan pencarian di buku bank.");
      setSearchRows([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const selectRow = (row: BukuBankRow) => {
    setSelected(row);
    setNewCabang(row.cabang ?? "");
    setNewDiterimaDibayar(row.diterima_dibayar ?? "");
    setNewKeterangan(row.keterangan ?? "");
    setMessage(null);
  };

  const handleSave = async () => {
    if (!selected) return;

    setSaving(true);
    setMessage(null);

    const payload = {
      cabang: newCabang.trim() || null,
      diterima_dibayar: newDiterimaDibayar.trim() || null,
      keterangan: newKeterangan.trim() || null,
    };

    try {
      const res = await fetch(`/api/buku-bank/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json: any = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(json?.message || "Gagal update data buku bank.");
        return;
      }

      setMessage("Berhasil update data.");

      const updated = json?.data as BukuBankRow;

      const updateOne = (list: BukuBankRow[]) =>
        list.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)) as BukuBankRow[];

      setRowsToFix((prev) => updateOne(prev));
      setSearchRows((prev) => updateOne(prev));
      setSelected(updated);
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message || "Gagal update data buku bank.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Edit Cabang • Buku Bank</h1>

      {/* SECTION 1 */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">
          Data yang perlu dicek (cabang / diterima_dibayar)
        </h2>

        {loadingRowsToFix ? (
          <div className="text-sm text-slate-500">Loading data...</div>
        ) : (
          <BukuBankTable
            rows={rowsToFix}
            onEdit={selectRow}
            emptyMessage="Tidak ada data yang memenuhi kriteria di atas."
          />
        )}
      </section>

      {/* PANEL EDIT */}
      <BukuBankEditPanel
        selected={selected}
        newCabang={newCabang}
        onChangeCabang={setNewCabang}
        newDiterimaDibayar={newDiterimaDibayar}
        onChangeDiterimaDibayar={setNewDiterimaDibayar}
        newKeterangan={newKeterangan}
        onChangeKeterangan={setNewKeterangan}
        onSave={handleSave}
        saving={saving}
      />

      {message && <div className="text-sm font-medium text-blue-700">{message}</div>}

      {/* SECTION 2 */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">
          Pencarian berdasarkan keterangan
        </h2>

        <EditSearchBox
          query={query}
          onQueryChange={setQuery}
          loading={loadingSearch}
          onSearch={handleSearch}
          placeholder="ketik kata kunci ..."
        />

        <BukuBankTable
          rows={searchRows}
          onEdit={selectRow}
          emptyMessage="Belum ada hasil pencarian."
        />
      </section>
    </div>
  );
}
