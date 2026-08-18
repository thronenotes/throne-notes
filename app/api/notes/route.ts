import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const data = await db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.updatedAt));
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, title, content } = body;
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const [note] = await db.insert(notes).values({ userId, title: title || null, content: content || "" }).returning();
  return NextResponse.json(note);
}