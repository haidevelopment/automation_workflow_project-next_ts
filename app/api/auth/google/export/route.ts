import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";

const EXPORT_SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/documents",
  "openid",
  "email",
];

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

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const returnTo = url.searchParams.get("returnTo") || "/workflow";
    const debug = url.searchParams.get("debug") === "1";

    const statePayload = Buffer.from(
      JSON.stringify({
        nonce: crypto.randomBytes(16).toString("hex"),
        returnTo,
      }),
      "utf8"
    ).toString("base64url");

    const oauth2Client = new OAuth2Client(
      getRequiredEnv("GOOGLE_CLIENT_ID"),
      getRequiredEnv("GOOGLE_CLIENT_SECRET"),
      buildCallbackUrl(req)
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: EXPORT_SCOPES,
      include_granted_scopes: true,
      state: statePayload,
    });

    if (debug) {
      return NextResponse.json({
        redirectUri: buildCallbackUrl(req),
        authUrl,
        scopes: EXPORT_SCOPES,
      });
    }

    const res = NextResponse.redirect(authUrl);
    res.cookies.set("google_export_oauth_state", statePayload, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60,
    });
    return res;
  } catch (err: any) {
    const message = err?.message ?? String(err);
    const details = process.env.NODE_ENV !== "production" ? String(err?.stack ?? "") : undefined;
    return NextResponse.json({ error: message, details }, { status: 500 });
  }
}
