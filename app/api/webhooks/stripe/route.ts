import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CREDITS_PACKS } from "@/lib/workflow/billing/pricing";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature") as string;

  console.log("--- STRIPE WEBHOOK RECEIVED ---");
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("Event Type:", event.type);
  } catch (err: any) {
    console.error(`[STRIPE WEBHOOK VERIFY ERROR]: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  if (event.type === "checkout.session.completed") {
    const { userId, packId } = session.metadata || {};
    console.log("Session Metadata:", { userId, packId });

    if (!userId || !packId) {
      console.error("[STRIPE WEBHOOK ERROR]: Missing metadata in session");
      return new NextResponse("Missing metadata", { status: 400 });
    }

    const pack = CREDITS_PACKS.find((p) => p.id === packId);
    if (!pack) {
      console.error("[STRIPE WEBHOOK ERROR]: Invalid packId", packId);
      return new NextResponse("Invalid pack ID", { status: 400 });
    }

    try {
      console.log(`Attempting to add ${pack.credits} credits to user ${userId}...`);
      await prisma.$transaction([
        prisma.userBalance.upsert({
          where: { userId },
          create: {
            userId,
            credits: pack.credits,
          },
          update: {
            credits: {
              increment: pack.credits,
            },
          },
        }),
        prisma.creditTransaction.create({
          data: {
            userId,
            amount: pack.credits,
            type: "DEPOSIT",
            description: `Nạp tiền: Gói ${pack.name}`,
          },
        }),
      ]);

      console.log(`[STRIPE WEBHOOK SUCCESS]: Added ${pack.credits} credits to user ${userId}`);
    } catch (error: any) {
      console.error("[STRIPE WEBHOOK DATABASE ERROR]:", error.message);
      return new NextResponse("Database update failed", { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
