import { NextResponse } from "next/server";

export const runtime = "nodejs";

const N8N_URL = "https://kabel.web.id/webhook/faktur-penjualan";

export async function POST(req: Request) {
  const body = await req.json();

  const upstream = await fetch(N8N_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const contentType = upstream.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await upstream.json()
    : await upstream.text();

  return NextResponse.json(
    { ok: upstream.ok, status: upstream.status, data },
    { status: upstream.ok ? 200 : upstream.status }
  );
}
