import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  try {
    const { bookId, buyerId } = await req.json();
    if (!bookId || !buyerId) {
      return NextResponse.json({ error: "Missing bookId or buyerId" }, { status: 400 });
    }

    const bookRes = await db.select().from(books).where(eq(books.id, bookId));
    if (bookRes.length === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
    const book = bookRes[0];

    const price = parseFloat(book.priceDigital || "0");
    if (price <= 0) {
      return NextResponse.json({ error: "Book is free" }, { status: 400 });
    }

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: (book.currency || "usd").toLowerCase(),
            product_data: {
              name: book.title,
              description: book.subtitle || undefined,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/books/${book.slug}?unlocked=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/books/${book.slug}`,
      metadata: {
        bookId,
        buyerId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}