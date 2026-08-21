import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { purchases, treasury } from "@/lib/db/schema";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { bookId, buyerId } = session.metadata || {};

    if (bookId && buyerId) {
      const amount = (session.amount_total || 0) / 100;
      const currency = session.currency?.toUpperCase() || "USD";

      await db.insert(purchases).values({
        buyerId,
        bookId,
        amount: String(amount),
        currency,
        stripePaymentIntentId: session.payment_intent as string,
      }).onConflictDoNothing();

      await db.insert(treasury).values({
        userId: buyerId,
        source: "book_purchase",
        amount: String(amount),
        currency,
        description: `Purchase of book ${bookId}`,
        metadata: JSON.stringify({ bookId, sessionId: session.id }),
      });
    }
  }

  return NextResponse.json({ received: true });
}