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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(invoices).where(eq(invoices.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}