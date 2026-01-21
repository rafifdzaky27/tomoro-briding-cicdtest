"use client";

import { useEffect, useState } from "react";

import type { SalesRow } from "@/types/sales";
import { SalesTable } from "@/components/tables/sales-edit-table";
import { EditSearchBox } from "@/components/box/edit-search-box";
import { SalesEditPanel } from "@/components/panels/sales-edit-panel";

export default function EditSalesPage() {
  const [nullRows, setNullRows] = useState<SalesRow[]>([]);
  const [loadingNull, setLoadingNull] = useState(true);

  const [query, setQuery] = useState("");
  const [searchRows, setSearchRows] = useState<SalesRow[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [selected, setSelected] = useState<SalesRow | null>(null);
  const [newCabang, setNewCabang] = useState("");
  const [newChannel, setNewChannel] = useState("");
  const [newDiterima, setNewDiterima] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // load data cabang/channel NULL
  useEffect(() => {
    const controller = new AbortController();

    const loadNull = async () => {
      setLoadingNull(true);
      setMessage(null);

      try {
        const res = await fetch("/api/sales-tomoro/to-fix?limit=100", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const json: any = await res.json().catch(() => ({}));

        if (!res.ok) {
          setMessage(json?.message || "Gagal memuat data NULL dari sales_tomoro.");
          setNullRows([]);
          return;
        }

        setNullRows((json?.data || []) as SalesRow[]);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error(err);
        setMessage(err?.message || "Gagal memuat data NULL dari sales_tomoro.");
        setNullRows([]);
      } finally {
        setLoadingNull(false);
      }
    };

    void loadNull();
    return () => controller.abort();
  }, []);

  const handleSearch = async () => {
    const q = query.trim();

    setSearchRows([]);
    setSelected(null);
    setNewCabang("");
    setNewChannel("");
    setNewDiterima("");
    setMessage(null);

    if (!q) return;

    setLoadingSearch(true);

    try {
      const res = await fetch(
        `/api/sales-tomoro/search?q=${encodeURIComponent(q)}&limit=50`,
        { method: "GET", cache: "no-store" }
      );

      const json: any = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(json?.message || "Gagal melakukan pencarian di sales_tomoro.");
        setSearchRows([]);
        return;
      }

      setSearchRows((json?.data || []) as SalesRow[]);
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message || "Gagal melakukan pencarian di sales_tomoro.");
      setSearchRows([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const selectRow = (row: SalesRow) => {
    setSelected(row);
    setNewCabang(row.cabang ?? "");
    setNewChannel(row.channel ?? "");
    setNewDiterima(row.diterima ?? "");
    setMessage(null);
  };

  const handleSave = async () => {
    if (!selected) return;

    setSaving(true);
    setMessage(null);

    const payload = {
      cabang: newCabang.trim() || null,
      channel: newChannel.trim() || null,
      // diterima sengaja tidak di-update (ikuti behavior lama).
      // kalau mau update juga, bilang ya.
    };

    try {
      const res = await fetch(`/api/sales-tomoro/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json: any = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(json?.message || "Gagal update cabang/channel di sales_tomoro.");
        return;
      }

      setMessage("Berhasil update cabang & channel.");

      const updated = (json?.data || null) as SalesRow | null;
      if (!updated) return;

      const updateOne = (list: SalesRow[]) =>
        list.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)) as SalesRow[];

      setNullRows((prev) => updateOne(prev));
      setSearchRows((prev) => updateOne(prev));
      setSelected(updated);
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message || "Gagal update cabang/channel di sales_tomoro.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">
        Edit Cabang &amp; Channel • Sales Tomoro
      </h1>

      {/* SECTION 1 */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">
          Data dengan cabang / channel NULL
        </h2>

        {loadingNull ? (
          <div className="text-sm text-slate-500">Loading data...</div>
        ) : (
          <SalesTable
            rows={nullRows}
            onEdit={selectRow}
            emptyMessage="Tidak ada data cabang / channel NULL."
          />
        )}
      </section>

      {/* PANEL EDIT */}
      <SalesEditPanel
        selected={selected}
        newCabang={newCabang}
        newChannel={newChannel}
        newDiterima={newDiterima}
        onChangeCabang={setNewCabang}
        onChangeChannel={setNewChannel}
        onChangeDiterima={setNewDiterima}
        onSave={handleSave}
        saving={saving}
      />

      {message && (
        <div className="text-sm font-medium text-blue-700">{message}</div>
      )}

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
          placeholder="ketik kata kunci, contoh: kopi tomoro ..."
        />

        <SalesTable
          rows={searchRows}
          onEdit={selectRow}
          emptyMessage="Belum ada hasil pencarian."
        />
      </section>
    </div>
  );
}
