"use client";

import { useEffect, useState } from "react";
import {
  RekonsiliasiFilterBar,
  type StatusFilter,
} from "@/components/bar/rekonsiliasi-filter-bar";
import {
  RekonsiliasiTable,
  type RekonsiliasiRow,
} from "@/components/tables/rekonsiliasi-table";
import {
  FilePreviewModal,
  toDrivePreviewUrl,
} from "@/components/modals/rekonsiliasi-file-preview-modal";

export default function RekonsiliasiPage() {
  const [rows, setRows] = useState<RekonsiliasiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch("/api/rekonsiliasi", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const json: any = await res.json().catch(() => ({}));

        if (!res.ok) {
          setErrorMsg(json?.message || "Gagal mengambil data.");
          setRows([]);
          return;
        }

        // nominal bisa string kalau numeric -> amanin di render table kalau perlu
        setRows((json?.data ?? []) as RekonsiliasiRow[]);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error(err);
        setErrorMsg(err?.message || "Gagal mengambil data.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
    return () => controller.abort();
  }, []);

  const filteredRows = rows.filter((row) => {
    if (statusFilter === "all") return true;
    return row.status === statusFilter;
  });

  const handlePreviewLink = (rawUrl: string) => {
    const url = toDrivePreviewUrl(rawUrl);
    setPreviewUrl(url);
    setIsPreviewOpen(true);
  };

  return (
    <>
      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
        <header className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Rekonsiliasi</h1>
            <p className="text-sm text-slate-500">
              Data dari tabel <span className="font-mono">rekonsiliasi</span>.
            </p>
          </div>

          <RekonsiliasiFilterBar value={statusFilter} onChange={setStatusFilter} />
        </header>

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Mengambil data...
          </div>
        )}

        {errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Gagal mengambil data: {errorMsg}
          </div>
        )}

        {!loading && !errorMsg && (
          <RekonsiliasiTable rows={filteredRows} onPreviewLink={handlePreviewLink} />
        )}
      </main>

      <FilePreviewModal
        open={isPreviewOpen}
        url={previewUrl}
        onClose={() => setIsPreviewOpen(false)}
      />
    </>
  );
}
