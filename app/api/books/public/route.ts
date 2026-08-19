import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { books, profiles } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const authorId = req.nextUrl.searchParams.get("authorId");

  const conditions: any[] = [eq(books.status, "published")];
  if (authorId) conditions.push(eq(books.creatorId, authorId));

  const publicBooks = await db
    .select({
      id: books.id,
      title: books.title,
      subtitle: books.subtitle,
      description: books.description,
      slug: books.slug,
      publishedAt: books.publishedAt,
      creatorId: books.creatorId,
      authorName: profiles.fullName,
      authorDisplayName: profiles.displayName,
    })
    .from(books)
    .leftJoin(profiles, eq(books.creatorId, profiles.id))
    .where(and(...conditions))
    .orderBy(desc(books.publishedAt));

  return NextResponse.json(publicBooks);
}