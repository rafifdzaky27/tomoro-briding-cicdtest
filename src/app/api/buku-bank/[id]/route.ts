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
    const diterima_dibayar =
      typeof body?.diterima_dibayar === "string" ? body.diterima_dibayar.trim() : null;
    const keterangan =
      typeof body?.keterangan === "string" ? body.keterangan.trim() : null;

    const payload = {
      cabang: cabang || null,
      diterima_dibayar: diterima_dibayar || null,
      keterangan: keterangan || null,
    };

    const result = await pool.query(
      `
      UPDATE public.buku_bank
      SET cabang = $1, diterima_dibayar = $2, keterangan = $3
      WHERE id = $4
      RETURNING id, "date", bank_record, cabang, diterima_dibayar, cr_db, keterangan, nominal, saldo
      `,
      [payload.cabang, payload.diterima_dibayar, payload.keterangan, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "Data tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows[0] }, { status: 200 });
  } catch (err: any) {
    console.error("API buku-bank update error:", err);
    return NextResponse.json(
      { message: "Gagal update data buku bank." },
      { status: 500 }
    );
  }
}
