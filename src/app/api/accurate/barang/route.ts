import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const { rows } = await pool.query(
    `SELECT
        id,
        kode_barang,
        CASE
          WHEN nama IS NULL THEN ''
          WHEN jsonb_typeof(nama) = 'array' THEN COALESCE(nama->>0, '')
          ELSE COALESCE(nama #>> '{}', '')
        END AS nama_utama
     FROM public.accurate_barang
     ORDER BY kode_barang NULLS LAST
     LIMIT 2000`
  );

  return NextResponse.json({ data: rows });
}
