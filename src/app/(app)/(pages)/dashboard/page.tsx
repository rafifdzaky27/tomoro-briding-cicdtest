// src\app\(app)\pages\dashboard\page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

export default function BridgingTomoroDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [checking, setChecking] = useState(true); // lagi cek login atau belum

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("currentUser");

    if (!stored) {
      // ❌ Tidak ada user → arahkan ke login
      router.replace("/login");
      return;
    }

    try {
      const parsed: CurrentUser = JSON.parse(stored);
      setUser(parsed);
    } catch {
      // data korup → paksa login ulang
      localStorage.removeItem("currentUser");
      router.replace("/login");
      return;
    } finally {
      setChecking(false);
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser");
    }
    router.replace("/login");
  };

  const goToLogin = () => router.push("/login");
  const goToRegister = () => router.push("/register");

  // Selama cek login, jangan render dashboard dulu
  if (checking) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="text-xs text-slate-500">Memeriksa sesi login...</div>
      </main>
    );
  }

  // Guard tambahan: kalau tetep nggak ada user (fallback)
  if (!user) {
    return null;
  }

  return (
    <main className="mx-auto max-w-6xl">
      {/* Header section */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Bridging Tomoro
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Dashboard untuk memantau proses bridging transaksi Tomoro dengan data
            rekening koran. Lihat status sinkronisasi, rekonsiliasi, dan aktivitas
            terbaru secara ringkas.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 text-right">
          <div className="text-xs text-slate-500">Login sebagai</div>
          <div className="text-sm font-semibold">{user.name || "User"}</div>
          <div className="text-xs text-slate-500">{user.email}</div>
          <button
            onClick={handleLogout}
            className="mt-3 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <SummaryCard
          label="Total Rekening Koran Terimpor"
          value="1.248"
          helper="Dari berbagai file upload n8n"
        />
        <SummaryCard
          label="Transaksi Terjembatani"
          value="982"
          helper="Sudah terhubung ke Tomoro"
        />
        <SummaryCard
          label="Perlu Rekonsiliasi"
          value="34"
          helper="Butuh pengecekan manual"
        />
        <SummaryCard
          label="Sinkron Terakhir"
          value="Hari ini"
          helper="09:32 WIB"
        />
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {/* Pipelines status */}
        <section className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">
            Status Pipeline Bridging
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Monitoring alur otomatisasi mulai dari upload rekening koran,
            parsing, hingga pushing ke sistem Tomoro.
          </p>

          <div className="mt-4 space-y-3">
            <PipelineRow
              name="01 – Upload Rekening Koran"
              status="OK"
              detail="File masuk dari n8n / webhook"
            />
            <PipelineRow
              name="02 – Parsing & Normalisasi"
              status="OK"
              detail="Format tanggal & nominal sudah dibersihkan"
            />
            <PipelineRow
              name="03 – Deteksi Duplikasi"
              status="OK"
              detail="Duplikasi dicegah sebelum insert ke DB"
            />
            <PipelineRow
              name="04 – Push ke Tomoro"
              status="Warning"
              detail="Beberapa request lambat, perlu dicek"
            />
          </div>
        </section>

        {/* Recent activity */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">
            Aktivitas Terbaru
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Ringkasan event terbaru dari proses bridging.
          </p>

          <ul className="mt-4 space-y-3 text-xs">
            <ActivityItem
              time="09:32"
              title="Sinkronisasi rekening BCA berhasil"
              desc="24 transaksi baru terhubung ke Tomoro"
            />
            <ActivityItem
              time="09:05"
              title="Deteksi duplikasi"
              desc="5 transaksi duplikat di-skip dari insert"
            />
            <ActivityItem
              time="08:47"
              title="Upload file rekening_koran_jan.csv"
              desc="Sumber: n8n webhook – HPI internal"
            />
            <ActivityItem
              time="08:15"
              title="Perubahan mapping akun"
              desc="Mapping outlet Tomoro diperbarui"
            />
          </ul>
        </section>
      </div>
    </main>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
  helper?: string;
};

function SummaryCard({ label, value, helper }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
      {helper && <div className="mt-1 text-[11px] text-slate-500">{helper}</div>}
    </div>
  );
}

type PipelineRowProps = {
  name: string;
  status: "OK" | "Warning" | "Error";
  detail?: string;
};

function PipelineRow({ name, status, detail }: PipelineRowProps) {
  const statusColor =
    status === "OK"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : status === "Warning"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-red-100 text-red-700 border-red-200";

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
      <div>
        <div className="text-xs font-semibold text-slate-800">{name}</div>
        {detail && <div className="mt-1 text-[11px] text-slate-500">{detail}</div>}
      </div>
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusColor}`}
      >
        {status}
      </span>
    </div>
  );
}

type ActivityItemProps = {
  time: string;
  title: string;
  desc?: string;
};

function ActivityItem({ time, title, desc }: ActivityItemProps) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-[2px] w-10 shrink-0 text-[10px] font-medium text-slate-500">
        {time}
      </div>
      <div className="flex-1">
        <div className="text-xs font-semibold text-slate-800">{title}</div>
        {desc && <div className="text-[11px] text-slate-500">{desc}</div>}
      </div>
    </li>
  );
}