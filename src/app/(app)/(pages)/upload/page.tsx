"use client";

import Link from "next/link";

export default function RekonsiliasiIndexPage() {
  return (
    <main className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
        Upload Data
      </h1>
      <p className="mt-2 max-w-xl text-sm text-slate-600">
        Modul untuk mengotomatiskan pembaruan dashboard sales, buku bank, dan rekonsiliasi 
        transaksi Tomoro. Unggah file HTML rekening koran untuk diproses otomatis melalui n8n.
      </p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">
          Upload File Rekening Koran
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Gunakan halaman upload untuk mengirim file HTML rekening koran ke
          webhook n8n.
          <br />
          Setelah berhasil, sistem akan melakukan proses dan hasilnya akan muncul di
          halaman Sales Tomoro, Buku Bank, dan Rekonsiliasi.
        </p>

        <div className="mt-4">
          <Link
            href="/upload/rekening-koran"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Upload File Rekening Koran
          </Link>
        </div>
      </div>
    </main>
  );
}