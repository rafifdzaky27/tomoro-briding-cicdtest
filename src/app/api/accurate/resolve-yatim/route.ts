import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

type Body = {
  yatimId: string;
  mode: "match" | "new";
  accurateId: string | null;
  kodeBarang: number | null;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Body;

  if (!body?.yatimId || !body?.mode) {
    return NextResponse.json({ message: "Payload tidak valid" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ambil nama yatim (biar sumber data fix dari DB)
    const yatimRes = await client.query(
      `SELECT id, nama FROM public.accurate_barang_yatim WHERE id = $1`,
      [body.yatimId]
    );

    if (yatimRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Data yatim tidak ditemukan" },
        { status: 404 }
      );
    }

    const yatimNama: string = yatimRes.rows[0].nama;

    if (body.mode === "match") {
      if (!body.accurateId) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { message: "accurateId wajib untuk mode match" },
          { status: 400 }
        );
      }

      // append nama yatim ke accurate_barang.nama (JSONB) sebagai ARRAY (multi-alias)
      await client.query(
        `
        UPDATE public.accurate_barang
        SET nama =
          CASE
            WHEN nama IS NULL THEN jsonb_build_array($1)
            WHEN jsonb_typeof(nama) = 'array' THEN
              CASE
                WHEN (nama ? $1) THEN nama
                ELSE nama || jsonb_build_array($1)
              END
            ELSE
              CASE
                WHEN COALESCE(nama #>> '{}','') = $1 THEN jsonb_build_array($1)
                ELSE jsonb_build_array(COALESCE(nama #>> '{}',''), $1)
              END
          END
        WHERE id = $2
        `,
        [yatimNama, body.accurateId]
      );
    } else {
      // mode new
      if (
        typeof body.kodeBarang !== "number" ||
        !Number.isFinite(body.kodeBarang)
      ) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { message: "kodeBarang wajib (angka) untuk mode new" },
          { status: 400 }
        );
      }

      const kode = body.kodeBarang;

      // buat record accurate_barang baru
      // id deterministik biar tidak dobel (nama + kode)
      // IMPORTANT: CAST eksplisit ke BIGINT untuk kode_barang
      await client.query(
        `
        INSERT INTO public.accurate_barang (id, kode_barang, nama)
        VALUES (
          md5(lower(trim($1)) || ':' || $2::text),
          $2::bigint,
          jsonb_build_array($1)
        )
        ON CONFLICT (id) DO UPDATE
        SET kode_barang = EXCLUDED.kode_barang
        `,
        [yatimNama, kode]
      );
    }

    // hapus dari yatim setelah berhasil masuk accurate_barang
    await client.query(
      `DELETE FROM public.accurate_barang_yatim WHERE id = $1`,
      [body.yatimId]
    );

    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: e?.message ?? "Server error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
