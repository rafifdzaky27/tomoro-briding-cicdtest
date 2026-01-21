"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DetailRow } from "@/components/row/rekonsiliasi-detail-row";
import {
  FilePreviewModal,
  toDrivePreviewUrl,
} from "@/components/modals/rekonsiliasi-file-preview-modal";

type RekonsiliasiRow = {
  id: number;
  bank_record: string | null;
  nominal: number | null;
  channel: string | null;
  cabang: string | null;
  link: string | null;
  status: "matched" | "unmatched" | null;
  created_at: string;
};

export default function RekonsiliasiDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [data, setData] = useState<RekonsiliasiRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch(`/api/rekonsiliasi/${id}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const json: any = await res.json().catch(() => ({}));

        if (!res.ok) {
          setErrorMsg(json?.message || "Gagal mengambil data.");
          setData(null);
          return;
        }

        setData((json?.data || null) as RekonsiliasiRow | null);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error(err);
        setErrorMsg(err?.message || "Gagal mengambil data.");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
    return () => controller.abort();
  }, [id]);

  const openPreview = (rawUrl: string) => {
    const url = toDrivePreviewUrl(rawUrl);
    setPreviewUrl(url);
    setIsPreviewOpen(true);
  };

  if (!id) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <p>Invalid ID.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-sm text-slate-500">Mengambil data...</p>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-sm text-red-700">Gagal mengambil data: {errorMsg}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <p>Data tidak ditemukan.</p>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Tombol back */}
        <div className="mb-4">
          <Link
            href="/rekonsiliasi"
            className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M12.707 15.707a1 1 0 01-1.414 0L6.586 11l4.707-4.707a1 1 0 011.414 1.414L9.414 11l3.293 3.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>Kembali ke Rekonsiliasi</span>
          </Link>
        </div>

        <h1 className="mb-6 text-2xl font-semibold">Detail Rekonsiliasi</h1>

        <div className="space-y-2 text-sm">
          <DetailRow label="Bank Record" value={data.bank_record ?? "-"} />
          <DetailRow
            label="Nominal"
            value={data.nominal !== null ? Number(data.nominal).toLocaleString("id-ID") : "-"}
          />
          <DetailRow label="Channel" value={data.channel ?? "-"} />
          <DetailRow label="Cabang" value={data.cabang ?? "-"} />
          <DetailRow
            label="Link"
            value={
              data.link ? (
                <button
                  type="button"
                  onClick={() => openPreview(data.link!)}
                  className="text-blue-600 underline-offset-2 hover:underline"
                >
                  Buka link
                </button>
              ) : (
                "-"
              )
            }
          />
          <DetailRow label="Status" value={data.status ?? "-"} />
          <DetailRow
            label="Created At"
            value={new Date(data.created_at).toLocaleString("id-ID")}
          />
        </div>
      </main>

      <FilePreviewModal
        open={isPreviewOpen}
        url={previewUrl}
        onClose={() => setIsPreviewOpen(false)}
      />
    </>
  );
}
