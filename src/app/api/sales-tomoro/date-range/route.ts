import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        to_char(MIN("transaction_date")::date, 'YYYY-MM-DD') AS start_date,
        to_char(MAX("transaction_date")::date, 'YYYY-MM-DD') AS end_date
      FROM public.sales_tomoro
    `);

    const row = result.rows?.[0] ?? null;

    return NextResponse.json(
      {
        startDate: row?.start_date ?? null,
        endDate: row?.end_date ?? null,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("API sales_tomoro date-range error:", err);
    return NextResponse.json(
      { message: "Gagal mengambil range tanggal sales_tomoro." },
      { status: 500 }
    );
  }
}
