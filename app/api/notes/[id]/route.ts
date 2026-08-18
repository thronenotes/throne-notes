import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { title, content } = await req.json();
  await db.update(notes).set({ title, content, updatedAt: new Date() }).where(eq(notes.id, id));
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(notes).where(eq(notes.id, id));
  return NextResponse.json({ success: true });
}