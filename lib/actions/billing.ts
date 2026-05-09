"use server";

import "server-only";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { DEFAULT_CREDITS } from "../workflow/billing/pricing";

async function assertAuthedUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("unauthenticated");
  return { userId };
}

export async function getUserBalance() {
  const { userId } = await assertAuthedUser();

  let balance = await (prisma as any).userBalance.findUnique({
    where: { userId },
  });

  if (!balance) {
    // Nếu chưa có balance, tạo mới với số credit mặc định
    balance = await (prisma as any).userBalance.create({
      data: {
        userId,
        credits: DEFAULT_CREDITS,
      },
    });

    // Tạo transaction khuyến mãi cho lần đầu
    await (prisma as any).creditTransaction.create({
      data: {
        userId,
        amount: DEFAULT_CREDITS,
        type: "DEPOSIT",
        description: "Welcome credits",
      },
    });
  }

  return balance as { userId: string; credits: number };
}

export async function getTransactionHistory() {
  const { userId } = await assertAuthedUser();

  return await (prisma as any).creditTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
