import { NextResponse } from "next/server";
import { accurateRequest } from "@/lib/accurate/client";

export async function GET() {
  const host = process.env.ACCURATE_ACCOUNT_HOST ?? "https://account.accurate.id";
  const data = await accurateRequest<any>({
    host,
    path: "/api/db-list.do",
    method: "GET",
  });
  return NextResponse.json(data);
}
