import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { books, chapters, profiles } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const bookRes = await db.select().from(books).where(eq(books.slug, slug));
  if (bookRes.length === 0) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  const book = bookRes[0];
  if (book.status !== "published") return NextResponse.json({ error: "Not published" }, { status: 403 });

  const chaptersRes = await db
    .select()
    .from(chapters)
    .where(eq(chapters.bookId, book.id))
    .orderBy(asc(chapters.orderIndex));

  const authorRes = await db.select().from(profiles).where(eq(profiles.id, book.creatorId));

  const author = authorRes[0];
  return NextResponse.json({
    book,
    chapters: chaptersRes,
    author: author
      ? { name: author.displayName || author.fullName || "Unknown Author", id: author.id, bio: author.bio }
      : null,
  });
}