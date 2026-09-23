import { NextRequest, NextResponse } from "next/server";
import { apiBase } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${apiBase()}/notifications/subscribe/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}
