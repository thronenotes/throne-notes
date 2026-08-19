import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const result = await db.select().from(profiles).where(eq(profiles.id, userId));
  if (result.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { passwordHash, ...safe } = result[0];
  return NextResponse.json(safe);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { userId, ...updates } = body;
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const [updated] = await db
    .update(profiles)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(profiles.id, userId))
    .returning();

  const { passwordHash, ...safe } = updated;
  return NextResponse.json(safe);
}