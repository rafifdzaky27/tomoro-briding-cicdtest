import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = String(searchParams.get("q") ?? "").trim();
    const limit = Math.min(Number(searchParams.get("limit") ?? 50) || 50, 2000);

    if (!q) return NextResponse.json({ data: [] }, { status: 200 });

    const terms = q.split(/\s+/).filter(Boolean);

    const where =
      terms.length > 0
        ? terms.map((_, i) => `keterangan ILIKE $${i + 1}`).join(" AND ")
        : "TRUE";

    const params = terms.map((t) => `%${t}%`);

    const sql = `
      SELECT id, diterima, keterangan, jumlah, "date", cabang, channel
      FROM public.sales_tomoro
      WHERE ${where}
      ORDER BY "date" DESC, id DESC
      LIMIT $${params.length + 1}
    `;

    const result = await pool.query(sql, [...params, limit]);

    return NextResponse.json({ data: result.rows }, { status: 200 });
  } catch (err) {
    console.error("API sales_tomoro search error:", err);
    return NextResponse.json(
      { message: "Gagal melakukan pencarian di sales_tomoro." },
      { status: 500 }
    );
  }
}
