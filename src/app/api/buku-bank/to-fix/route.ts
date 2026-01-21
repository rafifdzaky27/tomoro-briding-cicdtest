import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 500) || 500, 2000);

    const result = await pool.query(
      `
      SELECT
        id, "date", bank_record, cabang, diterima_dibayar, cr_db, keterangan, nominal, saldo
      FROM public.buku_bank
      WHERE
        cabang IS NULL
        OR diterima_dibayar IS NULL
        OR diterima_dibayar = 'unknown'
        OR (cabang IS NOT NULL AND cabang NOT IN ('BEI','LOTTE'))
      ORDER BY "date" ASC, id ASC
      LIMIT $1
      `,
      [limit]
    );

    return NextResponse.json({ data: result.rows }, { status: 200 });
  } catch (err: any) {
    console.error("API buku-bank to-fix error:", err);
    return NextResponse.json(
      { message: "Gagal memuat data 'perlu dicek' dari buku bank." },
      { status: 500 }
    );
  }
}
