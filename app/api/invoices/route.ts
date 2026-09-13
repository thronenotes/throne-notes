import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoices, invoiceItems } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Create invoice
    const [invoice] = await db.insert(invoices).values({
      userId: body.userId,
      invoiceNumber: body.invoiceNumber,
      status: "draft",
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
      amountPaid: "0",
      balanceDue: body.balanceDue,
      notes: body.notes || null,
      terms: body.terms || null,
    }).returning();

    // Create line items
    if (body.items?.length > 0) {
      await db.insert(invoiceItems).values(
        body.items.map((item: any) => ({
          invoiceId: invoice.id,
          itemName: item.itemName,
          description: item.description || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          imageUrl: item.imageUrl || null,
        }))
      );
    }

    return NextResponse.json({ success: true, invoice });
  } catch (error: any) {
    console.error("Create invoice error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let query = db.select().from(invoices);
    if (userId) {
      query = query.where(eq(invoices.userId, userId)) as any;
    }

    const allInvoices = await query.orderBy(sql`${invoices.createdAt} desc`);

    // Fetch items for each invoice
    const enriched = await Promise.all(
      allInvoices.map(async (inv) => {
        const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, inv.id));
        return { ...inv, items };
      })
    );

    return NextResponse.json({ invoices: enriched });
  } catch (error: any) {
    console.error("Fetch invoices error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}