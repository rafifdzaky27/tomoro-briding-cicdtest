import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const year = Number(searchParams.get("year"));
    const month = Number(searchParams.get("month")); // 1-12

    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { message: "Parameter year/month tidak valid." },
        { status: 400 }
      );
    }

    // panggil function yang benar (return jsonb)
    const result = await pool.query(
      `SELECT public.fn_buku_bank_ringkasan_bulanan($1, $2) AS data`,
      [year, month]
    );

    const data = result.rows?.[0]?.data;

    if (data == null) {
      return NextResponse.json(
        { message: "Summary tidak ditemukan." },
        { status: 404 }
      );
    }

    // pg biasanya sudah balikin json sebagai object.
    // tapi kalau kebetulan jadi string, kita parse.
    const payload =
      typeof data === "string" ? JSON.parse(data) : data;

    return NextResponse.json(payload, { status: 200 });
  } catch (err: any) {
    console.error("API buku-bank summary error:", err);

    // tampilkan detail saat dev biar gampang debug
    const detail =
      process.env.NODE_ENV !== "production"
        ? { detail: err?.message ?? String(err), code: err?.code }
        : {};

    return NextResponse.json(
      { message: "Gagal mengambil summary buku bank.", ...detail },
      { status: 500 }
    );
  }
}
