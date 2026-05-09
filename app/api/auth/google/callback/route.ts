import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";

const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

function getRequiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function buildCallbackUrl(req: NextRequest) {
  const configured = process.env.GOOGLE_EXPORT_CALLBACK_URL;
  if (configured && configured.trim().length > 0) return configured.trim();
  return new URL("/api/auth/google/callback", req.url).toString();
}

async function fetchGoogleEmail(accessToken: string) {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const json = (await res.json()) as any; 
  if (!res.ok) {
    const msg = json?.error?.message || "Failed to fetch Google user info";
    throw new Error(msg);
  }

  return String(json.email || "");
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const cookieState = req.cookies.get("google_export_oauth_state")?.value;
  if (!cookieState || !state || cookieState !== state) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  let returnTo = "/workflow";
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
    if (typeof decoded?.returnTo === "string" && decoded.returnTo.trim().length > 0) {
      returnTo = decoded.returnTo;
    }
  } catch {}

  const oauth2Client = new OAuth2Client(
    getRequiredEnv("GOOGLE_CLIENT_ID"),
    getRequiredEnv("GOOGLE_CLIENT_SECRET"),
    buildCallbackUrl(req)
  );

  const tokenResponse = await oauth2Client.getToken(code);
  const tokens = tokenResponse.tokens;

  const accessToken = String(tokens.access_token || "");
  const refreshToken = tokens.refresh_token ? String(tokens.refresh_token) : undefined;
  const expiryDate = tokens.expiry_date ? new Date(tokens.expiry_date) : undefined;

  if (!accessToken) {
    return NextResponse.json({ error: "Missing access_token" }, { status: 400 });
  }

  const email = await fetchGoogleEmail(accessToken);
  if (!email) {
    return NextResponse.json({ error: "Missing Google email" }, { status: 400 });
  }

  await prisma.userCredentials.upsert({
    where: {
      userId_provider: {
        userId,
        provider: "google_export",
      },
    },
    create: {
      userId,
      provider: "google_export",
      email,
      accessToken,
      refreshToken,
      expiryDate,
    },
    update: {
      email,
      accessToken,
      refreshToken: refreshToken ?? undefined,
      expiryDate,
    },
  });

  const res = NextResponse.redirect(new URL(returnTo, req.url));
  res.cookies.delete("google_export_oauth_state");
  return res;
}
