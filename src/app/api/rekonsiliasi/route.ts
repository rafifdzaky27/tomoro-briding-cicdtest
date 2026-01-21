import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_req: Request) {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        bank_record,
        nominal,
        channel,
        cabang,
        link,
        status,
        created_at
      FROM public.rekonsiliasi
      ORDER BY created_at DESC, id DESC
      `
    );

    return NextResponse.json({ data: result.rows }, { status: 200 });
  } catch (err) {
    console.error("API rekonsiliasi list error:", err);
    return NextResponse.json(
      { message: "Gagal mengambil data rekonsiliasi." },
      { status: 500 }
    );
  }
}
