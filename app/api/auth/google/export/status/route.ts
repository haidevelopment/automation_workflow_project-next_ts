import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ connected: false }, { status: 200 });

  const cred = await prisma.userCredentials.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: "google_export",
      },
    },
    select: {
      email: true,
    },
  });

  return NextResponse.json({
    connected: Boolean(cred?.email),
    email: cred?.email || null,
  });
}
