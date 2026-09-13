import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Update status to sent
    await db.update(invoices)
      .set({ status: "sent", updatedAt: new Date() })
      .where(eq(invoices.id, id));

    // TODO: Integrate your email service here (Resend, SendGrid, etc.)
    // await sendEmail({ to: invoice.customerEmail, subject: `Invoice ${invoice.invoiceNumber}`, ... });

    return NextResponse.json({ success: true, message: "Invoice marked as sent" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}