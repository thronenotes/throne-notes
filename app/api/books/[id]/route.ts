import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { books, chapters } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(chapters).where(eq(chapters.bookId, id));
    await db.delete(books).where(eq(books.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
  }
}