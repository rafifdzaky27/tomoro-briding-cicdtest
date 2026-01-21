"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SalesTomoroTable,
  type SalesRow,
} from "@/components/tables/sales-tomoro-table";
import { SummaryCard } from "@/components/cards/sales-summary-card";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

type SalesSummary = {
  total_jumlah: number;
  by_cabang: { cabang: string | null; total_jumlah: number }[] | null;
  by_channel: { channel: string | null; total_jumlah: number }[] | null;
  sales_rows: SalesRow[] | null;
};

export default function SalesTomoroPage() {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [rows, setRows] = useState<SalesRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // BI summary
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const formatRupiah = (v: number) =>
    Number(v ?? 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

  const fetchSummaryWithRange = async (start: string, end: string) => {
    if (!start || !end) return;

    try {
      setLoading(true);
      setLoadingSummary(true);
      setSummaryError(null);
      setErrorMsg(null);

      const res = await fetch(
        `/api/sales-tomoro/summary?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
        { method: "GET", cache: "no-store" }
      );

      const json: any = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = json?.message || "Gagal mengambil ringkasan.";
        throw new Error(msg);
      }

      const row = (json?.data ?? null) as SalesSummary | null;

      setSummary(row);
      setRows(((row?.sales_rows as any) || []) as SalesRow[]);
    } catch (err: any) {
      console.error("Error fetch sales_summary:", err);
      const msg = err?.message ?? "Gagal mengambil ringkasan.";
      setSummaryError(msg);
      setErrorMsg(msg);
      setSummary(null);
      setRows([]);
    } finally {
      setLoading(false);
      setLoadingSummary(false);
    }
  };

  // cek login
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("currentUser");
    if (!stored) {
      setCheckingAuth(false);
      router.replace("/login");
      return;
    }

    try {
      const parsed: CurrentUser = JSON.parse(stored);
      setUser(parsed);
    } catch {
      localStorage.removeItem("currentUser");
      router.replace("/login");
      return;
    } finally {
      setCheckingAuth(false);
    }
  }, [router]);

  // init: ambil min & max date dari API, lalu panggil summary
  useEffect(() => {
    if (checkingAuth) return;

    const initData = async () => {
      try {
        setLoading(true);
        setLoadingSummary(true);
        setErrorMsg(null);
        setSummaryError(null);

        const res = await fetch("/api/sales-tomoro/date-range", {
          method: "GET",
          cache: "no-store",
        });

        const json: any = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json?.message || "Gagal mengambil data awal sales_tomoro.");
        }

        const first = json?.startDate as string | null;
        const last = json?.endDate as string | null;

        if (first && last) {
          setStartDate(first);
          setEndDate(last);
          await fetchSummaryWithRange(first, last);
        } else {
          setRows([]);
          setSummary(null);
          setLoading(false);
          setLoadingSummary(false);
        }
      } catch (err: any) {
        console.error("Error init sales_tomoro:", err);
        const msg = err?.message || "Gagal mengambil data awal sales_tomoro.";
        setErrorMsg(msg);
        setSummaryError(msg);
        setLoading(false);
        setLoadingSummary(false);
      }
    };

    void initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkingAuth]);

  if (checkingAuth) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-xs text-slate-500">Memeriksa sesi login...</p>
      </main>
    );
  }

  if (!user) return null;

  const topCabang =
    summary?.by_cabang && summary.by_cabang.length > 0 ? summary.by_cabang[0] : null;
  const topChannel =
    summary?.by_channel && summary.by_channel.length > 0 ? summary.by_channel[0] : null;

  return (
    <main className="mx-auto max-w-6xl">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Sales Tomoro
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Daftar data <span className="font-semibold">sales_tomoro</span> yang
            sudah di-bridging dari rekening koran ke sistem Tomoro.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-right text-xs text-slate-500">
          <div className="font-semibold text-slate-700">Login sebagai</div>
          <div className="text-sm text-slate-900">{user.name}</div>
          <div>{user.email}</div>
        </div>
      </div>

      {/* BI section dari sales_summary() */}
      <section className="mt-6 space-y-4">
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-700">Periode Ringkasan</p>
            <div className="flex flex-wrap gap-2">
              <div className="flex flex-col text-xs">
                <label className="mb-1 text-slate-600">Tanggal awal</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                />
              </div>
              <div className="flex flex-col text-xs">
                <label className="mb-1 text-slate-600">Tanggal akhir</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs md:items-end">
            {summaryError && <p className="text-[11px] text-red-500">{summaryError}</p>}
            <button
              type="button"
              onClick={() => fetchSummaryWithRange(startDate, endDate)}
              className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
              disabled={!startDate || !endDate || loadingSummary}
            >
              {loadingSummary ? "Menghitung..." : "Terapkan Periode"}
            </button>
            <p className="text-[11px] text-slate-500">
              Data diambil dari function <code>sales_summary</code>.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            label="Total Jumlah (Rp)"
            value={loadingSummary || !summary ? "…" : formatRupiah(summary.total_jumlah ?? 0)}
            helper={
              startDate && endDate ? `Periode ${startDate} – ${endDate}` : "Pilih periode terlebih dahulu"
            }
          />
          <SummaryCard
            label="Top Cabang"
            value={loadingSummary ? "…" : topCabang ? `${topCabang.cabang ?? "-"}` : "-"}
            helper={topCabang ? `Total ${formatRupiah(topCabang.total_jumlah)}` : "Belum ada data"}
          />
          <SummaryCard
            label="Top Channel"
            value={loadingSummary ? "…" : topChannel ? `${topChannel.channel ?? "-"}` : "-"}
            helper={topChannel ? `Total ${formatRupiah(topChannel.total_jumlah)}` : "Belum ada data"}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-800">Ringkasan per Cabang</h3>
            <p className="mb-2 mt-1 text-[11px] text-slate-500">
              Berdasarkan hasil <code>sales_summary.by_cabang</code>
            </p>

            <div className="max-h-64 overflow-auto text-xs">
              <table className="min-w-full text-left text-xs">
                <thead className="border-b border-slate-200 text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="py-1 pr-2">Cabang</th>
                    <th className="py-1 text-right">Total Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {summary?.by_cabang && summary.by_cabang.length > 0 ? (
                    summary.by_cabang.map((row, idx) => (
                      <tr key={`${row.cabang}-${idx}`} className="border-b border-slate-100">
                        <td className="py-1 pr-2">{row.cabang ?? "(tidak ada cabang)"}</td>
                        <td className="py-1 text-right">{formatRupiah(row.total_jumlah)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="py-2 text-center text-[11px] text-slate-400">
                        {loadingSummary ? "Mengambil ringkasan…" : "Tidak ada data."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-800">Ringkasan per Channel</h3>
            <p className="mb-2 mt-1 text-[11px] text-slate-500">
              Berdasarkan hasil <code>sales_summary.by_channel</code>
            </p>

            <div className="max-h-64 overflow-auto text-xs">
              <table className="min-w-full text-left text-xs">
                <thead className="border-b border-slate-200 text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="py-1 pr-2">Channel</th>
                    <th className="py-1 text-right">Total Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {summary?.by_channel && summary.by_channel.length > 0 ? (
                    summary.by_channel.map((row, idx) => (
                      <tr key={`${row.channel}-${idx}`} className="border-b border-slate-100">
                        <td className="py-1 pr-2">{row.channel ?? "(tidak ada channel)"}</td>
                        <td className="py-1 text-right">{formatRupiah(row.total_jumlah)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="py-2 text-center text-[11px] text-slate-400">
                        {loadingSummary ? "Mengambil ringkasan…" : "Tidak ada data."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <SalesTomoroTable rows={rows} loading={loading} errorMsg={errorMsg} />
    </main>
  );
}
