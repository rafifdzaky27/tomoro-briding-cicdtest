import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const { id: idParam } = await params;

    const id = Number(idParam);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
    }

    const body = await req.json().catch(() => ({} as any));

    const cabang = typeof body?.cabang === "string" ? body.cabang.trim() : null;
    const channel = typeof body?.channel === "string" ? body.channel.trim() : null;

    const payload = {
      cabang: cabang || null,
      channel: channel || null,
    };

    const result = await pool.query(
      `
      UPDATE public.sales_tomoro
      SET cabang = $1, channel = $2
      WHERE id = $3
      RETURNING id, diterima, keterangan, jumlah, "date", cabang, channel
      `,
      [payload.cabang, payload.channel, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "Data tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows[0] }, { status: 200 });
  } catch (err) {
    console.error("API sales_tomoro update error:", err);
    return NextResponse.json(
      { message: "Gagal update cabang/channel di sales_tomoro." },
      { status: 500 }
    );
  }
}
