"use server";

import "server-only";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

type CredentialType = "GOOGLE" | "OPENAI" | "GEMINI";

type CredentialStatus = "ACTIVE" | "VALID" | "EXPIRED" | "INVALID";

function getEncryptionKey(): Buffer {
  const raw = process.env.CREDENTIALS_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("Missing env: CREDENTIALS_ENCRYPTION_KEY");
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("CREDENTIALS_ENCRYPTION_KEY must be 32 bytes base64 (AES-256-GCM)");
  }
  return key;
}

function encryptValue(plainText: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(Buffer.from(plainText, "utf8")), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${ciphertext.toString("base64")}`;
}

function decryptValue(encrypted: string): string {
  const key = getEncryptionKey();
  const parts = String(encrypted || "").split(".");
  if (parts.length !== 3) throw new Error("Invalid encrypted payload format");
  const [ivB64, tagB64, ctB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(ctB64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plain.toString("utf8");
}

async function assertAuthedUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("unauthenticated");
  return { userId };
}

export async function createCredential(params: {
  name: string;
  type: CredentialType;
  value?: string;
  returnTo?: string;
}): Promise<
  | { ok: true; id: string; type: CredentialType }
  | { ok: true; type: "GOOGLE"; oauthUrl: string }
> {
  const { userId } = await assertAuthedUser();

  const name = String(params.name || "").trim();
  const type = params.type;

  if (!name) throw new Error("name is required");
  if (!type) throw new Error("type is required");

  if (type === "GOOGLE") {
    const oauthUrl = `/api/auth/google/export?returnTo=${encodeURIComponent(params.returnTo || "/credentials")}`;

    const existing = await (prisma as any).credentials.findFirst({
      where: { userId, type: "GOOGLE", name },
      select: { id: true },
    });

    if (!existing) {
      await (prisma as any).credentials.create({
        data: {
          userId,
          name,
          type: "GOOGLE",
          value: encryptValue("google_export"),
          status: "ACTIVE" as CredentialStatus,
        },
        select: { id: true },
      });
    }

    revalidatePath("/credentials");
    return { ok: true, type: "GOOGLE", oauthUrl };
  }

  const value = String(params.value || "");
  if (!value) throw new Error("value is required");

  const existing = await (prisma as any).credentials.findFirst({
    where: { userId, type, name },
    select: { id: true },
  });

  const encrypted = encryptValue(value);
  const created = existing
    ? await (prisma as any).credentials.update({
        where: { id: existing.id },
        data: { value: encrypted, status: "ACTIVE" },
        select: { id: true, type: true },
      })
    : await (prisma as any).credentials.create({
        data: { userId, name, type, value: encrypted, status: "ACTIVE" },
        select: { id: true, type: true },
      });

  revalidatePath("/credentials");
  return { ok: true, id: created.id, type: created.type as CredentialType };
}

export async function deleteCredential(id: string) {
  const { userId } = await assertAuthedUser();
  const credId = String(id || "").trim();
  if (!credId) throw new Error("id is required");

  await (prisma as any).credentials.deleteMany({
    where: { id: credId, userId },
  });

  revalidatePath("/credentials");
  return { ok: true } as const;
}

async function validateOpenAI(apiKey: string) {
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
  });
  return res.ok;
}

async function validateGemini(apiKey: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, { cache: "no-store" });
  return res.ok;
}

async function validateGoogleExport(userId: string) {
  const cred = await prisma.userCredentials.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: "google_export",
      },
    },
    select: {
      accessToken: true,
      expiryDate: true,
    },
  });

  if (!cred?.accessToken) return { ok: false, status: "INVALID" as const };
  if (cred.expiryDate && cred.expiryDate.getTime() <= Date.now() + 30_000) {
    return { ok: false, status: "EXPIRED" as const };
  }

  const res = await fetch("https://www.googleapis.com/drive/v3/about?fields=user", {
    headers: {
      Authorization: `Bearer ${cred.accessToken}`,
    },
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403) return { ok: false, status: "INVALID" as const };
  if (!res.ok) return { ok: false, status: "INVALID" as const };
  return { ok: true, status: "VALID" as const };
}

export async function validateCredential(id: string) {
  const { userId } = await assertAuthedUser();
  const credId = String(id || "").trim();
  if (!credId) throw new Error("id is required");

  const cred = await (prisma as any).credentials.findFirst({
    where: { id: credId, userId },
    select: { id: true, type: true, value: true },
  });

  if (!cred) throw new Error("Credential not found");

  let newStatus: CredentialStatus = "INVALID";

  if (cred.type === "OPENAI") {
    const apiKey = decryptValue(cred.value);
    const ok = await validateOpenAI(apiKey);
    newStatus = ok ? "VALID" : "INVALID";
  } else if (cred.type === "GEMINI") {
    const apiKey = decryptValue(cred.value);
    const ok = await validateGemini(apiKey);
    newStatus = ok ? "VALID" : "INVALID";
  } else if (cred.type === "GOOGLE") {
    const g = await validateGoogleExport(userId);
    newStatus = g.status;
  }

  await (prisma as any).credentials.update({
    where: { id: cred.id },
    data: {
      status: newStatus as any,
      lastUsedAt: new Date(),
    },
  });

  revalidatePath("/credentials");
  return { ok: true, status: newStatus } as const;
}

export async function getCredentialsForUserByType(type: string) {
  const { userId } = await assertAuthedUser();
  return await (prisma as any).credentials.findMany({
    where: { userId, type },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
