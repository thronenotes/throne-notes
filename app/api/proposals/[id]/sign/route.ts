import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contracts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.signatureData) {
      return NextResponse.json({ error: "Signature required" }, { status: 400 });
    }

    const [updated] = await db
      .update(contracts)
      .set({
        signatureData: body.signatureData,
        status: "signed",
        signedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(contracts.id, id))
      .returning();

    return NextResponse.json({ success: true, contract: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}