import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { books, journalEntries, followers, profiles } from "@/lib/db/schema";
import { eq, desc, and, inArray, isNull, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Step 1: Get IDs of people this user follows
    const followingRows = await db.select({ followingId: followers.followingId })
      .from(followers)
      .where(eq(followers.followerId, userId));

    const followingIds = followingRows.map((r) => r.followingId);
    if (followingIds.length === 0) {
      return NextResponse.json([]);
    }

    // Step 2: Get published books from followed authors
    const bookItems = await db
      .select({
        id: books.id,
        type: books.id, // we'll map this
        title: books.title,
        subtitle: books.subtitle,
        slug: books.slug,
        authorId: books.creatorId,
        authorName: profiles.displayName,
        authorFullName: profiles.fullName,
        createdAt: books.publishedAt,
        priceDigital: books.priceDigital,
      })
      .from(books)
      .leftJoin(profiles, eq(books.creatorId, profiles.id))
      .where(and(
        eq(books.status, "published"),
        inArray(books.creatorId, followingIds)
      ));

    // Step 3: Get public journal entries from followed authors
    const entryItems = await db
      .select({
        id: journalEntries.id,
        title: journalEntries.title,
        content: journalEntries.content,
        entryType: journalEntries.entryType,
        authorId: journalEntries.userId,
        authorName: profiles.displayName,
        authorFullName: profiles.fullName,
        createdAt: journalEntries.createdAt,
      })
      .from(journalEntries)
      .leftJoin(profiles, eq(journalEntries.userId, profiles.id))
      .where(and(
        eq(journalEntries.isPrivate, false),
        inArray(journalEntries.userId, followingIds)
      ));

    // Step 4: Merge and sort
    const feed = [
      ...bookItems.map((b) => ({
        type: "book" as const,
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        slug: b.slug,
        authorId: b.authorId,
        authorName: b.authorName || b.authorFullName || "Unknown",
        createdAt: b.createdAt,
        priceDigital: b.priceDigital,
      })),
      ...entryItems.map((e) => ({
        type: "entry" as const,
        id: e.id,
        title: e.title || "Untitled Revelation",
        content: e.content,
        entryType: e.entryType,
        authorId: e.authorId,
        authorName: e.authorName || e.authorFullName || "Unknown",
        createdAt: e.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
     .slice(offset, offset + limit);

    return NextResponse.json(feed);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load feed" }, { status: 500 });
  }
}