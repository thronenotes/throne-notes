import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contracts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await db.select().from(contracts).where(eq(contracts.id, id));

    if (result.length === 0) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    if (!result[0].viewedAt) {
      await db.update(contracts)
        .set({ viewedAt: new Date(), status: "viewed" })
        .where(eq(contracts.id, id));
    }

    return NextResponse.json({ contract: result[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const [updated] = await db
      .update(contracts)
      .set({
        status: body.status || undefined,
        signatureData: body.signatureData || undefined,
        signedAt: body.signedAt || undefined,
        stripePaymentLink: body.stripePaymentLink || undefined,
        updatedAt: new Date(),
      })
      .where(eq(contracts.id, id))
      .returning();

    return NextResponse.json({ success: true, contract: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}