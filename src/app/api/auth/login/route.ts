// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db"; // pastikan kamu sudah punya pool postgres

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT id, name, email, password
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { message: "Email atau password salah." },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Email atau password salah." },
        { status: 401 }
      );
    }

    const safeUser = { id: user.id, name: user.name, email: user.email };

    return NextResponse.json({ user: safeUser }, { status: 200 });
  } catch (err) {
    console.error("API login error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat login." },
      { status: 500 }
    );
  }
}
