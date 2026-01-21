"use client";

import { useMemo, useState } from "react";

type RowRecord = Record<string, string>;

type MappingState = {
  barang: string;
  netSales: string;
  grossSales: string;
  salesQty: string; // ✅ baru
};

const N8N_TARGET = "https://kabel.web.id/webhook-test/faktur-penjualan"; // catatan saja (kita proxy via /api)

const STATIC_KEYS = {
  nomorFaktur: "Nomor Faktur",
  keterangan: "Keterangan",
  tanggalReport: "Tanggal Report",
  kodePelanggan: "Kode Pelanggan",

  barang: "Barang",
  netSales: "Net Sales",
  grossSales: "Gross Sales",
  salesQty: "Sales Qty", // ✅ baru
  discountAmount: "Discount Amount", // ✅ gross - net
};

function parseCSV(text: string): { headers: string[]; records: RowRecord[] } {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const firstLine = normalized.split("\n").find((l) => l.trim().length > 0) ?? "";
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const delimiter = semiCount > commaCount ? ";" : ",";

  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i++) {
    const c = normalized[i];

    if (c === '"') {
      const next = normalized[i + 1];
      if (inQuotes && next === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && c === delimiter) {
      row.push(field);
      field = "";
      continue;
    }

    if (!inQuotes && c === "\n") {
      row.push(field);
      field = "";
      if (row.some((x) => x.trim().length > 0)) rows.push(row);
      row = [];
      continue;
    }

    field += c;
  }

  row.push(field);
  if (row.some((x) => x.trim().length > 0)) rows.push(row);

  if (rows.length === 0) return { headers: [], records: [] };

  const headers = rows[0].map((h) => (h ?? "").toString().trim()).filter(Boolean);

  const records: RowRecord[] = rows.slice(1).map((r) => {
    const obj: RowRecord = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] ?? "").toString().trim();
    });
    return obj;
  });

  return { headers, records };
}

function looksLikeExcel(fileName: string) {
  const lower = fileName.toLowerCase();
  return lower.endsWith(".xlsx") || lower.endsWith(".xls");
}

async function parseXLSX(file: File): Promise<{ headers: string[]; records: RowRecord[] }> {
  // dynamic import biar bundle gak berat
  const XLSX = await import("xlsx");

  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });

  const sheetName = wb.SheetNames?.[0];
  if (!sheetName) return { headers: [], records: [] };

  const ws = wb.Sheets[sheetName];
  if (!ws) return { headers: [], records: [] };

  // ambil sebagai array 2D (header = baris pertama)
  const aoa = XLSX.utils.sheet_to_json<any[]>(ws, {
    header: 1,
    raw: false, // pakai formatted text (lebih aman untuk angka besar)
    defval: "", // sel kosong jadi ""
    blankrows: false,
  }) as any[][];

  // cari baris pertama yang punya isi (header)
  const headerRowIndex = aoa.findIndex((r) => (r ?? []).some((c) => String(c ?? "").trim().length > 0));
  if (headerRowIndex < 0) return { headers: [], records: [] };

  const headerRow = aoa[headerRowIndex] ?? [];
  const headers = headerRow.map((h) => String(h ?? "").trim()).filter(Boolean);

  const dataRows = aoa.slice(headerRowIndex + 1);

  const records: RowRecord[] = dataRows
    .filter((r) => (r ?? []).some((c) => String(c ?? "").trim().length > 0))
    .map((r) => {
      const obj: RowRecord = {};
      headers.forEach((h, idx) => {
        obj[h] = String(r?.[idx] ?? "").trim();
      });
      return obj;
    });

  return { headers, records };
}

/**
 * parse angka fleksibel (mendukung 1.234,56 atau 1,234.56, ada Rp, spasi, dll)
 */
function parseNumberLoose(input: string): number {
  const raw = String(input ?? "").trim();
  if (!raw) return 0;

  // detect negatif via (123) atau -123
  const negative = /^\(.*\)$/.test(raw) || raw.includes("-");
  const cleaned = raw
    .replace(/\(|\)/g, "")
    .replace(/-/g, "")
    .replace(/[^\d.,]/g, ""); // keep digit, dot, comma

  if (!cleaned) return 0;

  const lastDot = cleaned.lastIndexOf(".");
  const lastComma = cleaned.lastIndexOf(",");

  let normalized = cleaned;

  // kalau ada . dan , -> decimal separator = yang terakhir muncul
  if (lastDot !== -1 && lastComma !== -1) {
    const decimalIsDot = lastDot > lastComma;
    if (decimalIsDot) {
      // 1,234.56 -> remove commas
      normalized = cleaned.replace(/,/g, "");
    } else {
      // 1.234,56 -> remove dots, comma jadi dot
      normalized = cleaned.replace(/\./g, "").replace(/,/g, ".");
    }
  } else if (lastComma !== -1) {
    // hanya comma: anggap comma itu decimal
    normalized = cleaned.replace(/,/g, ".");
  } else {
    // hanya dot atau digit: biarkan
    normalized = cleaned;
  }

  const n = Number(normalized);
  if (Number.isNaN(n)) return 0;
  return negative ? -n : n;
}

export default function FakturPenjualanClient() {
  const [fileName, setFileName] = useState<string>("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [records, setRecords] = useState<RowRecord[]>([]);

  const [nomorFaktur, setNomorFaktur] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [tanggalReport, setTanggalReport] = useState(""); // yyyy-MM-dd
  const [kodePelanggan, setKodePelanggan] = useState("");

  const [mapping, setMapping] = useState<MappingState>({
    barang: "",
    netSales: "",
    grossSales: "",
    salesQty: "", // ✅ baru
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const previewRows = useMemo(() => records.slice(0, 5), [records]);

  const canSubmit =
    headers.length > 0 &&
    records.length > 0 &&
    nomorFaktur.trim().length > 0 &&
    tanggalReport.trim().length > 0 &&
    mapping.barang &&
    mapping.netSales &&
    mapping.grossSales &&
    mapping.salesQty; // ✅ wajib pilih

  const handleFile = async (f: File | null) => {
    setMessage(null);
    if (!f) return;

    setFileName(f.name);

    try {
      const parsed = looksLikeExcel(f.name) ? await parseXLSX(f) : parseCSV(await f.text());

      setHeaders(parsed.headers);
      setRecords(parsed.records);

      // reset mapping biar user pilih lagi sesuai file
      setMapping({ barang: "", netSales: "", grossSales: "", salesQty: "" });
    } catch (e: any) {
      setHeaders([]);
      setRecords([]);
      setMapping({ barang: "", netSales: "", grossSales: "", salesQty: "" });
      setMessage({ type: "err", text: `Gagal baca file: ${e?.message ?? "Unknown error"}` });
    }
  };

  /**
   * ✅ payload: meta sekali di root, items hanya per-row
   */
  const buildPayload = () => {
    const get = (row: RowRecord, headerName: string) => (headerName ? row[headerName] ?? "" : "");

    const items = records.map((row) => {
      const netStr = get(row, mapping.netSales);
      const grossStr = get(row, mapping.grossSales);

      const net = parseNumberLoose(netStr);
      const gross = parseNumberLoose(grossStr);
      const discount = gross - net;

      return {
        [STATIC_KEYS.barang]: get(row, mapping.barang),
        [STATIC_KEYS.salesQty]: get(row, mapping.salesQty), // ✅ baru
        [STATIC_KEYS.netSales]: netStr,
        [STATIC_KEYS.grossSales]: grossStr,
        [STATIC_KEYS.discountAmount]: String(discount), // ✅ computed
      };
    });

    return {
      source: "faktur-penjualan",
      target: N8N_TARGET, // info saja

      // ✅ meta sekali saja (bukan per item)
      [STATIC_KEYS.nomorFaktur]: nomorFaktur.trim(),
      [STATIC_KEYS.keterangan]: keterangan.trim(),
      [STATIC_KEYS.tanggalReport]: tanggalReport.trim(),
      [STATIC_KEYS.kodePelanggan]: kodePelanggan.trim(),

      rowCount: items.length,
      mappingUsed: mapping,
      items,
    };
  };

  const submit = async () => {
    setMessage(null);
    setSubmitting(true);
    try {
      const payload = buildPayload();

      const res = await fetch("/api/faktur-penjualan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") || "";
      const body = contentType.includes("application/json") ? await res.json() : await res.text();

      if (!res.ok) throw new Error(typeof body === "string" ? body : JSON.stringify(body));

      setMessage({ type: "ok", text: "Berhasil dikirim ke n8n ✅" });
    } catch (e: any) {
      setMessage({ type: "err", text: `Gagal kirim: ${e?.message ?? "Unknown error"}` });
    } finally {
      setSubmitting(false);
    }
  };

  const Select = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
  }) => (
    <label className="space-y-1">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <select
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={headers.length === 0}
      >
        <option value="">-- pilih kolom file --</option>
        {headers.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Faktur Penjualan</h1>
        <p className="text-sm text-slate-500">Upload CSV/XLSX → mapping kolom → kirim JSON ke n8n.</p>
      </div>

      {/* Upload */}
      <div className="rounded-lg border bg-white p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-medium">Up CSV / XLSX</div>
            <div className="text-xs text-slate-500">
              File dibaca header kolomnya, lalu dipakai untuk dropdown mapping.
            </div>
          </div>

          <input
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm md:w-auto"
          />
        </div>

        {fileName ? (
          <div className="mt-3 text-xs text-slate-600">
            File: <span className="font-medium">{fileName}</span> • Kolom:{" "}
            <span className="font-medium">{headers.length}</span> • Baris:{" "}
            <span className="font-medium">{records.length}</span>
          </div>
        ) : null}

        {message ? (
          <div
            className={`mt-3 rounded-md border px-3 py-2 text-sm ${
              message.type === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        ) : null}
      </div>

      {/* Form */}
      <div className="grid gap-4 rounded-lg border bg-white p-4 md:grid-cols-2">
        <label className="space-y-1">
          <div className="text-sm font-medium text-slate-700">Nomor Faktur</div>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={nomorFaktur}
            onChange={(e) => setNomorFaktur(e.target.value)}
            placeholder="contoh: FP-0001"
          />
        </label>

        <label className="space-y-1">
          <div className="text-sm font-medium text-slate-700">Tanggal Report</div>
          <input
            type="date"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={tanggalReport}
            onChange={(e) => setTanggalReport(e.target.value)}
          />
        </label>

        <label className="space-y-1 md:col-span-2">
          <div className="text-sm font-medium text-slate-700">Keterangan</div>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="contoh: Report penjualan harian"
          />
        </label>

        <label className="space-y-1 md:col-span-2">
          <div className="text-sm font-medium text-slate-700">Kode Pelanggan</div>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={kodePelanggan}
            onChange={(e) => setKodePelanggan(e.target.value)}
            placeholder="contoh: CUST001"
          />
          <div className="text-xs text-slate-500">(Ini dipakai sama untuk semua row.)</div>
        </label>

        <div className="md:col-span-2">
          <div className="text-sm font-semibold text-slate-800">Mapping Kolom (Dropdown)</div>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <Select
              label="Barang (ambil dari kolom file)"
              value={mapping.barang}
              onChange={(v) => setMapping((m) => ({ ...m, barang: v }))}
            />
            <Select
              label="Sales Qty (ambil dari kolom file)" // ✅ baru
              value={mapping.salesQty}
              onChange={(v) => setMapping((m) => ({ ...m, salesQty: v }))}
            />
            <Select
              label="Net Sales (ambil dari kolom file)"
              value={mapping.netSales}
              onChange={(v) => setMapping((m) => ({ ...m, netSales: v }))}
            />
            <Select
              label="Gross Sales (ambil dari kolom file)"
              value={mapping.grossSales}
              onChange={(v) => setMapping((m) => ({ ...m, grossSales: v }))}
            />
          </div>

          <div className="mt-2 text-xs text-slate-500">
            Discount Amount otomatis dihitung per baris: <span className="font-medium">Gross Sales - Net Sales</span>
          </div>

          <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit || submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Mengirim..." : "Kirim ke n8n"}
            </button>

            <div className="text-xs text-slate-500">
              Endpoint tujuan: <span className="font-medium">{N8N_TARGET}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-lg border bg-white p-4">
        <div>
          <div className="text-sm font-semibold">Preview 5 baris pertama</div>
          <div className="text-xs text-slate-500">Untuk cek apakah file sudah kebaca benar.</div>
        </div>

        {headers.length === 0 ? (
          <div className="mt-3 text-sm text-slate-500">Belum ada file CSV/XLSX.</div>
        ) : (
          <div className="mt-3 overflow-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50">
                  {headers.map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-600"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((r, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    {headers.map((h) => (
                      <td key={h} className="whitespace-nowrap px-3 py-2 text-slate-700">
                        {r[h] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
