"use client";

import { useEffect, useState } from "react";

import type {
  BukuBankRow,
  BukuBankSummaryResponse,
  CrDbDistribution,
} from "@/types/bukuBank";

import { BukuBankHeader } from "@/components/headers/buku-bank-header";
import { BukuBankDistributionTable } from "@/components/tables/buku-bank-distribution-table";
import { BukuBankDataTable } from "@/components/tables/buku-bank-data-table";

export default function BukuBankPage() {
  // bulan yang dipilih, format YYYY-MM
  const [month, setMonth] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  const [rows, setRows] = useState<BukuBankRow[]>([]);
  const [summary, setSummary] = useState<BukuBankSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      if (!month) return;

      setLoading(true);
      setMessage(null);

      const [yearStr, monthStr] = month.split("-");
      const year = Number(yearStr);
      const monthNum = Number(monthStr); // 1–12

      try {
        const res = await fetch(
          `/api/buku-bank/month-summary?year=${year}&month=${monthNum}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data: any = await res.json().catch(() => ({}));

        if (!res.ok) {
          setMessage(data?.message || "Gagal mengambil summary buku bank.");
          setRows([]);
          setSummary(null);
          return;
        }

        const result = data as BukuBankSummaryResponse;
        setSummary(result);
        setRows(result.data || []);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error(err);
        setMessage(err?.message || "Gagal mengambil summary buku bank.");
        setRows([]);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();

    return () => controller.abort();
  }, [month]);

  const totalDebit = summary?.total_debit ?? 0;
  const totalKredit = summary?.total_kredit ?? 0;
  const profit = summary?.profit ?? 0;
  const saldoAkhir = summary?.saldo_akhir ?? null;
  const jumlahTransaksi = summary?.jumlah_transaksi ?? rows.length;
  const distribusi: CrDbDistribution[] =
    summary?.distribusi_nominal_by_cr_db ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Buku Bank</h1>

      <BukuBankHeader
        month={month}
        onMonthChange={setMonth}
        jumlahTransaksi={jumlahTransaksi}
        profit={profit}
      />

      {message && (
        <div className="text-sm font-medium text-red-600">{message}</div>
      )}

      <BukuBankDistributionTable distribusi={distribusi} />

      <BukuBankDataTable rows={rows} loading={loading} />
    </div>
  );
}
