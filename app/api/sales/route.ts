import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sales } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

function safeDate(value: string | Date | null): Date {
  if (!value) return new Date();
  return new Date(value);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const totalPrice = Number(body.unitPrice) * Number(body.quantity || 1);
    const profit = totalPrice - (Number(body.costPrice || 0) * Number(body.quantity || 1));

    const [sale] = await db.insert(sales).values({
      userId: body.userId,
      itemName: body.itemName,
      category: body.category,
      quantity: body.quantity || 1,
      unitPrice: body.unitPrice,
      costPrice: body.costPrice || 0,
      totalPrice: totalPrice.toFixed(2),
      profit: profit.toFixed(2),
      currency: body.currency || "USD",
      notes: body.notes || null,
      saleDate: body.saleDate || new Date().toISOString().split("T")[0],
    }).returning();

    return NextResponse.json({ success: true, sale });
  } catch (error: any) {
    console.error("Create sale error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let query = db.select().from(sales);
    
    if (userId) {
      query = query.where(eq(sales.userId, userId)) as any;
    }

    const allSales = await query.orderBy(sql`${sales.saleDate} desc`);

    const totalRevenue = allSales.reduce((sum, s) => sum + Number(s.totalPrice), 0);
    const totalProfit = allSales.reduce((sum, s) => sum + Number(s.profit), 0);
    const totalCost = allSales.reduce((sum, s) => sum + (Number(s.costPrice) * s.quantity), 0);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeek = allSales.filter(s => safeDate(s.saleDate) >= weekAgo);
    const thisMonth = allSales.filter(s => safeDate(s.saleDate) >= monthAgo);

    return NextResponse.json({
      sales: allSales,
      stats: {
        totalRevenue,
        totalProfit,
        totalCost,
        totalTransactions: allSales.length,
        thisWeekRevenue: thisWeek.reduce((sum, s) => sum + Number(s.totalPrice), 0),
        thisWeekProfit: thisWeek.reduce((sum, s) => sum + Number(s.profit), 0),
        thisMonthRevenue: thisMonth.reduce((sum, s) => sum + Number(s.totalPrice), 0),
        thisMonthProfit: thisMonth.reduce((sum, s) => sum + Number(s.profit), 0),
      }
    });
  } catch (error: any) {
    console.error("Fetch sales error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}