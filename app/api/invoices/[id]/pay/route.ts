import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoices, sales } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const createTreasuryEntry = body.createTreasuryEntry === true;

    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.update(invoices)
      .set({
        status: "paid",
        amountPaid: invoice.total,
        balanceDue: "0",
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id));

    let treasuryCreated = false;

    if (createTreasuryEntry) {
      await db.insert(sales).values({
        userId: invoice.userId,
        itemName: `Invoice ${invoice.invoiceNumber} — ${invoice.customerName}`,
        category: "other",
        quantity: 1,
        unitPrice: invoice.total,
        costPrice: "0",
        totalPrice: invoice.total,
        profit: invoice.total,
        currency: invoice.currency,
        notes: `Auto-generated from paid invoice ${invoice.invoiceNumber}. ${invoice.notes || ""}`,
        saleDate: new Date().toISOString().split("T")[0],
      });
      treasuryCreated = true;
    }

    return NextResponse.json({ success: true, treasuryCreated });
  } catch (error: any) {
    console.error("Mark paid error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}