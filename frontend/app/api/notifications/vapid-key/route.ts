import { NextResponse } from "next/server";
import { apiBase } from "@/lib/api";

export async function GET() {
  try {
    const res = await fetch(`${apiBase()}/notifications/vapid-key/`, {
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}
