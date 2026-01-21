import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id: idParam } = await params;

    const id = Number(idParam);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

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
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    const row = result.rows?.[0];

    if (!row) {
      return NextResponse.json({ message: "Data tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ data: row }, { status: 200 });
  } catch (err) {
    console.error("API rekonsiliasi detail error:", err);
    return NextResponse.json(
      { message: "Gagal mengambil data rekonsiliasi." },
      { status: 500 }
    );
  }
}
