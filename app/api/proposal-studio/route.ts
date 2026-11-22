import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contracts } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.userId || !body.clientName || !body.projectTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const contractNumber = `PROP-${Date.now().toString().slice(-6)}`;

    const [contract] = await db.insert(contracts).values({
      contractNumber,
      creatorId: body.userId,
      clientName: body.clientName,
      clientEmail: body.clientEmail || "no-email@provided.com",
      clientPhone: body.clientPhone || null,
      clientCompany: body.clientCompany || null,
      projectTitle: body.projectTitle,
      serviceType: body.serviceType || "general",
      projectBrief: body.projectBrief,
      scopeOfWork: body.scopeOfWork || null,
      deliverables: body.deliverables || null,
      timeline: body.timeline || null,
      totalFee: body.totalFee || "0",
      depositPercent: body.depositPercent || 50,
      currency: body.currency || "USD",
      status: "draft",
      aiGenerated: true,
      templateStyle: body.templateStyle || "cinematic",
    }).returning();

    return NextResponse.json({ success: true, contract });
  } catch (error: any) {
    console.error("Proposal studio error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}