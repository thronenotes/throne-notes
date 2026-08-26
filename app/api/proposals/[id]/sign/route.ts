import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contracts } from "@/lib/db/schema";
import { sendProposalSignedEmail } from "@/lib/email";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
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
      .where(eq(contracts.id, params.id))
      .returning();

    // Notify creator
    const creatorResult = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, params.id));

    // You'd need to fetch creator email from profiles table here
    // For now, log it
    console.log(`Proposal ${updated.contractNumber} signed by ${updated.clientName}`);

    return NextResponse.json({ success: true, contract: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}