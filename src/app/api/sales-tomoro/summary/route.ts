import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

const onlyDate = (v: string) => {
  // terima "YYYY-MM-DD" atau ISO, ambil 10 char pertama
  const s = (v ?? "").trim();
  return s.length >= 10 ? s.slice(0, 10) : s;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const start = onlyDate(String(searchParams.get("start") ?? ""));
    const end = onlyDate(String(searchParams.get("end") ?? ""));

    if (!start || !end) {
      return NextResponse.json(
        { message: "Parameter start/end wajib diisi." },
        { status: 400 }
      );
    }

    // panggil function kamu: fn_sales_tomoro_summary(date, date) RETURNS jsonb
    const result = await pool.query(
      `SELECT public.fn_sales_tomoro_summary($1::date, $2::date) AS data`,
      [start, end]
    );

    const data = result.rows?.[0]?.data;

    if (data == null) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    const payload = typeof data === "string" ? JSON.parse(data) : data;
    return NextResponse.json({ data: payload }, { status: 200 });
  } catch (err: any) {
    console.error("API fn_sales_tomoro_summary error:", err);
    const detail =
      process.env.NODE_ENV !== "production"
        ? { detail: err?.message ?? String(err), code: err?.code }
        : {};
    return NextResponse.json(
      { message: "Gagal mengambil ringkasan.", ...detail },
      { status: 500 }
    );
  }
}
