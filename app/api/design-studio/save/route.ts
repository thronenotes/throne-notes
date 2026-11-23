import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contracts } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.userId || !body.doc?.title) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const doc = body.doc;
    const totalFee = (doc.pricing || []).reduce(
      (sum: number, p: any) => sum + Number(p.amount || 0), 0
    );

    const [contract] = await db.insert(contracts).values({
      contractNumber: `DSGN-${Date.now().toString().slice(-6)}`,
      creatorId: body.userId,
      clientName: body.clientName || "Unspecified Client",
      clientEmail: body.clientEmail || "no-email@provided.com",
      projectTitle: doc.title,
      serviceType: body.format || "other",
      projectBrief: doc.executiveSummary || doc.subtitle || "AI-generated document",
      scopeOfWork: (doc.sections || [])
        .map((s: any) => `${s.heading}\n${(s.paragraphs || []).join("\n")}\n${(s.bullets || []).map((b: string) => "• " + b).join("\n")}`)
        .join("\n\n"),
      deliverables: (doc.sections || []).flatMap((s: any) => s.bullets || []).join("\n"),
      totalFee: totalFee.toFixed(2),
      currency: body.currency || "USD",
      status: "draft",
      aiGenerated: true,
      templateStyle: body.templateStyle || "cinematic",
    }).returning();

    return NextResponse.json({ success: true, contract });
  } catch (error: any) {
    console.error("Design studio save error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}