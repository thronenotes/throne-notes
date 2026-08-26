import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contracts } from "@/lib/db/schema";
import { sendProposalEmail } from "@/lib/email";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await db.select().from(contracts).where(eq(contracts.id, params.id));

    if (result.length === 0) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const contract = result[0];
    const proposalUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://thronenotes.com"}/proposal/${contract.id}`;

    await sendProposalEmail(
      contract.clientEmail,
      contract.clientName,
      contract.contractNumber,
      proposalUrl,
      contract.projectTitle
    );

    await db
      .update(contracts)
      .set({ status: "sent", updatedAt: new Date() })
      .where(eq(contracts.id, params.id));

    return NextResponse.json({ success: true, message: "Proposal sent" });
  } catch (error: any) {
    console.error("Send proposal error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}