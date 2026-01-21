import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 100) || 100, 2000);

    const result = await pool.query(
      `
      SELECT id, diterima, keterangan, jumlah, "date", cabang, channel
      FROM public.sales_tomoro
      WHERE cabang IS NULL OR channel IS NULL
      ORDER BY "date" DESC, id DESC
      LIMIT $1
      `,
      [limit]
    );

    return NextResponse.json({ data: result.rows }, { status: 200 });
  } catch (err) {
    console.error("API sales_tomoro to-fix error:", err);
    return NextResponse.json(
      { message: "Gagal memuat data NULL dari sales_tomoro." },
      { status: 500 }
    );
  }
}
