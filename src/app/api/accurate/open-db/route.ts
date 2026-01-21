import { NextResponse } from "next/server";
import { accurateRequest } from "@/lib/accurate/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const host = process.env.ACCURATE_ACCOUNT_HOST ?? "https://account.accurate.id";

  const data = await accurateRequest<any>({
    host,
    path: "/api/open-db.do",
    method: "GET",
    query: { id },
  });

  return NextResponse.json(data);
}
