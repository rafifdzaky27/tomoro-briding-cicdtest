import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const { rows } = await pool.query(
    `SELECT id, nama
     FROM public.accurate_barang_yatim
     ORDER BY nama ASC`
  );

  return NextResponse.json({ data: rows });
}
