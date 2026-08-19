import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { books, chapters } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const bookRes = await db.select().from(books).where(eq(books.id, id));
    if (bookRes.length === 0) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    const book = bookRes[0];
    const baseSlug = book.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const slug = book.slug || `${baseSlug}-${id.slice(0, 6)}`;

    await db.update(books).set({ status: "published", publishedAt: new Date(), slug }).where(eq(books.id, id));
    await db.update(chapters).set({ status: "published" }).where(eq(chapters.bookId, id));

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to publish" }, { status: 500 });
  }
}