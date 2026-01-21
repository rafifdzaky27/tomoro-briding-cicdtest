"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Message = { type: "success" | "error"; text: string } | null;

export default function RekonsiliasiUploadPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setMessage(null);

    if (!selected) {
      setFile(null);
      setPreview("");
      return;
    }

    // Batasi hanya HTML
    if (
      !selected.name.toLowerCase().endsWith(".html") &&
      !selected.type.includes("html")
    ) {
      setMessage({
        type: "error",
        text: "Hanya file HTML yang diperbolehkan (.html).",
      });
      setFile(null);
      setPreview("");
      return;
    }

    setFile(selected);

    // Baca sebagai text untuk preview
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreview(reader.result);
      }
    };
    reader.readAsText(selected);
  };

  const handleSend = async () => {
    setMessage(null);

    if (!file) {
      setMessage({ type: "error", text: "Pilih file HTML terlebih dahulu." });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "https://magangpsm.app.n8n.cloud/webhook/form-rekonsil",
        {
          method: "POST",
          headers: {
            "Content-Type": file.type || "text/html",
          },
          body: file, // ⬅️ kirim file sebagai binary body
        }
      );

      if (!res.ok) {
        throw new Error(`Gagal, status ${res.status}`);
      }

      setMessage({
        type: "success",
        text: "File berhasil dikirim ke n8n, mengarahkan ke halaman Rekonsiliasi...",
      });

      // Redirect ke /rekonsiliasi setelah sukses
      setTimeout(() => {
        router.push("/upload");
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setMessage({
        type: "error",
        text: err?.message || "Terjadi kesalahan saat mengirim file.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
        Upload Rekonsiliasi
      </h1>
      <p className="mt-2 max-w-xl text-sm text-slate-600">
        Unggah file HTML hasil rekonsiliasi, lihat preview-nya, lalu kirim sebagai
        binary ke webhook n8n <code>/webhook/form-rekonsil</code>.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Kolom kiri: upload & tombol */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">
            Upload File Rekonsiliasi (HTML)
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Pilih file <code>.html</code> yang akan dikirim ke n8n. File akan
            dikirim sebagai binary langsung di body request.
          </p>

          <div className="mt-4 space-y-3">
            <input
              type="file"
              accept=".html,text/html"
              onChange={handleFileChange}
              className="block w-full text-xs text-slate-600
                         file:mr-3 file:rounded-md file:border-0
                         file:bg-blue-50 file:px-3 file:py-1.5
                         file:text-xs file:font-medium file:text-blue-700
                         hover:file:bg-blue-100"
            />

            {file && (
              <div className="rounded-md bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                <div className="font-semibold">{file.name}</div>
                <div className="mt-1">
                  {(file.size / 1024).toFixed(1)} KB •{" "}
                  {file.type || "text/html"}
                </div>
              </div>
            )}

            {message && (
              <div
                className={`rounded-md px-3 py-2 text-[11px] ${
                  message.type === "success"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !file}
              className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Mengirim..." : "Kirim ke n8n"}
            </button>
          </div>
        </section>

        {/* Kolom kanan: preview */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">
            Preview HTML
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Konten HTML dari file akan ditampilkan di kotak kecil ini sebelum
            dikirim.
          </p>

          <div className="mt-3 h-72 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
            {preview ? (
              <iframe
                title="Preview HTML Rekonsiliasi"
                className="h-full w-full"
                sandbox=""
                srcDoc={preview}
              />
            ) : (
              <div className="flex h-full items-center justify-center px-3 text-center text-[11px] text-slate-400">
                Preview HTML akan muncul di sini setelah kamu memilih file.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}