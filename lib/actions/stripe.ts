"use server";

import "server-only";

import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { CREDITS_PACKS } from "../workflow/billing/pricing";
import { redirect } from "next/navigation";

async function assertAuthedUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("unauthenticated");
  return { userId };
}

export async function createCheckoutSession(packId: string) {
  const { userId } = await assertAuthedUser();

  const pack = CREDITS_PACKS.find((p) => p.id === packId);
  if (!pack) {
    throw new Error("Gói nạp tiền không hợp lệ");
  }

  // Lấy domain từ env hoặc mặc định localhost
  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Gói ${pack.name}`,
            description: `${pack.credits.toLocaleString()} Credits cho AutomationFlow`,
          },
          unit_amount: pack.price * 100, // Stripe tính theo cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      packId,
    },
    success_url: `${domain}/billing?success=true`,
    cancel_url: `${domain}/billing?canceled=true`,
  });

  if (!session.url) {
    throw new Error("Không thể tạo Stripe Session");
  }

  return session.url;
}
