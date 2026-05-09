import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const token = String(url.searchParams.get("token") ?? "").trim();
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const store: Map<string, any> = globalThis.__EXPORT_FILE_STORE__ || new Map();
  const item = store.get(token);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (item.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (typeof item.expiresAt === "number" && item.expiresAt < Date.now()) {
    store.delete(token);
    return NextResponse.json({ error: "Expired" }, { status: 410 });
  }

  const buffer: Buffer = item.buffer;

  const text = buffer.toString("utf8");
  const headers = new Headers();
  headers.set("Content-Type", "text/plain; charset=utf-8");
  return new NextResponse(text, { headers });
}

declare global {
  // eslint-disable-next-line no-var
  var __EXPORT_FILE_STORE__: Map<string, any> | undefined;
}
