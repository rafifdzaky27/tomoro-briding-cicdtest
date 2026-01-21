import crypto from "crypto";
import { NextResponse } from "next/server";

type ItemInput = {
  itemNo: string;
  qty: number;
  unitPrice: number; // keep required (biar harga & total muncul)
  discountPercent?: number; // 0..100
  discountAmount?: number; // >= 0
};

type Payload = {
  customerNo: string;
  transDate: string; // "YYYY-MM-DD" atau "DD/MM/YYYY"

  // header
  number?: string; // No Faktur #
  description?: string; // Keterangan

  items: ItemInput[];

  // diskon header (optional)
  invoiceDiscountPercent?: number;
  invoiceDiscountAmount?: number;
};

function makeTimestampISO() {
  return new Date().toISOString();
}

function makeSignatureBase64(timestampISO: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(timestampISO).digest("base64");
}

function normalizeDateToAccurate(input: string) {
  // Accurate umumnya DD/MM/YYYY
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split("-");
    return `${d}/${m}/${y}`;
  }
  return input;
}

function toNumberOrUndef(v: unknown) {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function cleanStr(v: unknown) {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : undefined;
}

/**
 * ✅ PAKAI sales-invoice/save.do (non bulk)
 * -> agar tidak jadi DRAFT dan nomor tidak diprefix DFT
 */
function buildFormUrlEncodedSave(payload: Payload) {
  const form = new URLSearchParams();

  // === header ===
  form.set("customerNo", payload.customerNo);
  form.set("transDate", normalizeDateToAccurate(payload.transDate));

  // No Faktur # (custom)
  if (payload.number) form.set("number", payload.number);

  // Keterangan
  if (payload.description) form.set("description", payload.description);

  // === detail items ===
  payload.items.forEach((it, i) => {
    form.set(`detailItem[${i}].itemNo`, it.itemNo);
    form.set(`detailItem[${i}].quantity`, String(it.qty));
    form.set(`detailItem[${i}].unitPrice`, String(it.unitPrice));

    // Diskon per baris: percent prioritas, kalau tidak ada pakai nominal
    if (it.discountPercent !== undefined) {
      form.set(`detailItem[${i}].itemDiscPercent`, String(it.discountPercent));
      form.set(`detailItem[${i}].itemCashDiscount`, "0");
    } else if (it.discountAmount !== undefined) {
      form.set(`detailItem[${i}].itemCashDiscount`, String(it.discountAmount));
      // jangan kirim empty string kalau bisa; cukup omit
      // (biar gak dianggap invalid oleh beberapa endpoint)
    }
  });

  // === diskon header/invoice ===
  if (payload.invoiceDiscountPercent !== undefined) {
    form.set("cashDiscPercent", String(payload.invoiceDiscountPercent));
    form.set("cashDiscount", "0");
  } else if (payload.invoiceDiscountAmount !== undefined) {
    form.set("cashDiscount", String(payload.invoiceDiscountAmount));
  }

  return form.toString();
}

function parseMaybeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function POST(req: Request) {
  try {
    const token = process.env.ACCURATE_API_TOKEN;
    const secret = process.env.ACCURATE_SIGNATURE_SECRET;
    const host = process.env.ACCURATE_DATA_HOST || "https://zeus.accurate.id";

    if (!token || !secret) {
      return NextResponse.json(
        { ok: false, message: "Missing ACCURATE_API_TOKEN / ACCURATE_SIGNATURE_SECRET in .env" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as Partial<Payload>;

    // === validasi minimal ===
    const customerNo = cleanStr(body.customerNo);
    const transDate = cleanStr(body.transDate);

    if (!customerNo) return NextResponse.json({ ok: false, message: "customerNo is required" }, { status: 400 });
    if (!transDate) return NextResponse.json({ ok: false, message: "transDate is required" }, { status: 400 });
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ ok: false, message: "items is required" }, { status: 400 });
    }

    const items: ItemInput[] = body.items.map((it: any, i: number) => {
      const itemNo = cleanStr(it?.itemNo);
      if (!itemNo) throw new Error(`items[${i}].itemNo is required`);

      const qty = Number(it?.qty);
      if (!Number.isFinite(qty) || qty <= 0) throw new Error(`items[${i}].qty must be > 0`);

      const unitPrice = Number(it?.unitPrice);
      if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new Error(`items[${i}].unitPrice must be >= 0`);

      const discountPercent = toNumberOrUndef(it?.discountPercent);
      if (discountPercent !== undefined && (discountPercent < 0 || discountPercent > 100)) {
        throw new Error(`items[${i}].discountPercent must be 0..100`);
      }

      const discountAmount = toNumberOrUndef(it?.discountAmount);
      if (discountAmount !== undefined && discountAmount < 0) {
        throw new Error(`items[${i}].discountAmount must be >= 0`);
      }

      return { itemNo, qty, unitPrice, discountPercent, discountAmount };
    });

    const payload: Payload = {
      customerNo,
      transDate,
      number: cleanStr(body.number),
      description: cleanStr(body.description),
      items,
      invoiceDiscountPercent: toNumberOrUndef(body.invoiceDiscountPercent),
      invoiceDiscountAmount: toNumberOrUndef(body.invoiceDiscountAmount),
    };

    const ts = makeTimestampISO();
    const sig = makeSignatureBase64(ts, secret);

    // ✅ balik ke save.do biar hasilnya bukan DRAFT
    const url = `${host}/accurate/api/sales-invoice/save.do`;
    const formBody = buildFormUrlEncodedSave(payload);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Api-Timestamp": ts,
        "X-Api-Signature": sig,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    });

    const text = await res.text();
    const data = parseMaybeJson(text);

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, status: res.status, statusText: res.statusText, data },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Unknown error" }, { status: 500 });
  }
}
