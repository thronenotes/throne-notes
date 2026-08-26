import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contracts } from "@/lib/db/schema";
import { sendProposalEmail } from "@/lib/email";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9000) + 1000;
    const contractNumber = `CB-${year}-${random}`;

    const [contract] = await db
      .insert(contracts)
      .values({
        contractNumber,
        creatorId: body.creatorId,
        clientName: body.clientName,
        clientEmail: body.clientEmail,
        clientPhone: body.clientPhone || null,
        clientCompany: body.clientCompany || null,
        projectTitle: body.projectTitle,
        serviceType: body.serviceType,
        projectBrief: body.projectBrief,
        scopeOfWork: body.scopeOfWork || null,
        deliverables: body.deliverables || null,
        timeline: body.timeline || null,
        totalFee: body.totalFee,
        depositPercent: body.depositPercent || 50,
        currency: body.currency || "USD",
        aiGenerated: body.aiGenerated || false,
        templateStyle: body.templateStyle || "cinematic",
        status: "draft",
      })
      .returning();

    return NextResponse.json({ success: true, contract });
  } catch (error: any) {
    console.error("Create proposal error:", error);
    return NextResponse.json({ error: error.message || "Failed to create proposal" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get("creatorId");
    const status = searchParams.get("status");

    let query = db.select().from(contracts);

    if (creatorId) {
      query = query.where(eq(contracts.creatorId, creatorId)) as any;
    }

    const allContracts = await query;
    
    let result = allContracts;
    if (status) {
      result = allContracts.filter((c: any) => c.status === status);
    }

    return NextResponse.json({ contracts: result });
  } catch (error: any) {
    console.error("Fetch proposals error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}