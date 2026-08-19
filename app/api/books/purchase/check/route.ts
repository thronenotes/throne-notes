import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { purchases, books } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const bookId = searchParams.get("bookId");

    if (!userId || !bookId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    // Check if book is free
    const bookRes = await db.select().from(books).where(eq(books.id, bookId));
    if (bookRes.length === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
    const book = bookRes[0];

    // Free book or author owns it
    const isFree = !book.priceDigital || parseFloat(book.priceDigital) === 0;
    const isAuthor = book.creatorId === userId;

    if (isFree || isAuthor) {
      return NextResponse.json({ hasAccess: true, reason: isAuthor ? "author" : "free" });
    }

    // Check purchase
    const purchaseRes = await db.select().from(purchases).where(
      and(eq(purchases.buyerId, userId), eq(purchases.bookId, bookId))
    );

    return NextResponse.json({ hasAccess: purchaseRes.length > 0, reason: "purchase" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}