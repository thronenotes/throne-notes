import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoiceTemplates } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const [template] = await db.insert(invoiceTemplates).values({
      userId: body.userId,
      templateName: body.templateName,
      businessName: body.businessName,
      businessAddress: body.businessAddress || null,
      businessPhone: body.businessPhone || null,
      businessEmail: body.businessEmail || null,
      businessLogo: body.businessLogo || null,
      defaultCurrency: body.defaultCurrency || "USD",
      defaultTaxRate: body.defaultTaxRate || 0,
      defaultTerms: body.defaultTerms || null,
      defaultNotes: body.defaultNotes || null,
      isDefault: body.isDefault || false,
    }).returning();

    if (body.isDefault) {
      await db.update(invoiceTemplates)
        .set({ isDefault: false })
        .where(and(
          eq(invoiceTemplates.userId, body.userId),
          eq(invoiceTemplates.isDefault, true)
        ));
      await db.update(invoiceTemplates)
        .set({ isDefault: true })
        .where(eq(invoiceTemplates.id, template.id));
    }

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    console.error("Create template error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const templates = await db.select().from(invoiceTemplates)
      .where(eq(invoiceTemplates.userId, userId))
      .orderBy(invoiceTemplates.createdAt);

    return NextResponse.json({ templates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}