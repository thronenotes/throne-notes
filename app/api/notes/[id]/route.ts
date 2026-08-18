import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { title, content } = await req.json();
  await db.update(notes).set({ title, content, updatedAt: new Date() }).where(eq(notes.id, params.id));
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await db.delete(notes).where(eq(notes.id, params.id));
  return NextResponse.json({ success: true });
}