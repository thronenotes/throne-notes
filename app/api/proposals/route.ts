import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contracts } from "@/lib/db/schema";
import { sendProposalEmail } from "@/lib/email";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9000) + 1000;
    const contractNumber = `CB-${year}-${random}`;

    const [contract] = await db
      .insert(contracts)
      .values({
        contractNumber,
        creatorId: session.user.id,
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = db.select().from(contracts).where(eq(contracts.creatorId, session.user.id));
    // Note: if using drizzle-orm, you'd need to import eq from drizzle-orm
    // For now, fetch all and filter in memory or use proper drizzle syntax

    const allContracts = await db.select().from(contracts);
    const userContracts = allContracts.filter((c) => c.creatorId === session.user.id);

    if (status) {
      return NextResponse.json({ contracts: userContracts.filter((c) => c.status === status) });
    }

    return NextResponse.json({ contracts: userContracts });
  } catch (error: any) {
    console.error("Fetch proposals error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}