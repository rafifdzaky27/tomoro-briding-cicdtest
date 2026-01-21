import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = String(searchParams.get("q") ?? "").trim();
    const limit = Math.min(Number(searchParams.get("limit") ?? 200) || 200, 2000);

    if (!q) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const terms = q.split(/\s+/).filter(Boolean);

    // WHERE keterangan ILIKE $1 AND keterangan ILIKE $2 ...
    const where =
      terms.length > 0
        ? terms.map((_, i) => `keterangan ILIKE $${i + 1}`).join(" AND ")
        : "TRUE";

    const params = terms.map((t) => `%${t}%`);

    const sql = `
      SELECT
        id, "date", bank_record, cabang, diterima_dibayar, cr_db, keterangan, nominal, saldo
      FROM public.buku_bank
      WHERE ${where}
      ORDER BY "date" ASC, id ASC
      LIMIT $${params.length + 1}
    `;

    const result = await pool.query(sql, [...params, limit]);

    return NextResponse.json({ data: result.rows }, { status: 200 });
  } catch (err: any) {
    console.error("API buku-bank search error:", err);
    return NextResponse.json(
      { message: "Gagal melakukan pencarian di buku bank." },
      { status: 500 }
    );
  }
}
