import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoices, invoiceItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    return NextResponse.json({ invoice: { ...invoice, items } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Update invoice
    await db.update(invoices)
      .set({
        invoiceNumber: body.invoiceNumber,
        issueDate: body.issueDate,
        dueDate: body.dueDate,
        currency: body.currency || "USD",
        businessName: body.businessName,
        businessAddress: body.businessAddress || null,
        businessPhone: body.businessPhone || null,
        businessEmail: body.businessEmail || null,
        businessLogo: body.businessLogo || null,
        customerName: body.customerName,
        customerEmail: body.customerEmail || null,
        customerPhone: body.customerPhone || null,
        customerAddress: body.customerAddress || null,
        subtotal: body.subtotal,
        taxRate: body.taxRate || 0,
        taxAmount: body.taxAmount || "0",
        discount: body.discount || "0",
        total: body.total,
        balanceDue: body.balanceDue,
        notes: body.notes || null,
        terms: body.terms || null,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id));

    // Delete old items and re-insert
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));

    if (body.items?.length > 0) {
      await db.insert(invoiceItems).values(
        body.items.map((item: any) => ({
          invoiceId: id,
          itemName: item.itemName,
          description: item.description || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          imageUrl: item.imageUrl || null,
        }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update invoice error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(invoices).where(eq(invoices.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}