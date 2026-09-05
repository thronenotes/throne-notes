import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sales } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(sales).where(eq(sales.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}