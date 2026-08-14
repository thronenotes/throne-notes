import { NextRequest, NextResponse } from "next/server";
import { calculateFullProfile } from "@/lib/numerology";

export async function POST(request: NextRequest) {
  try {
    const { name, birthDate, forDate } = await request.json();
    if (!name || !birthDate) {
      return NextResponse.json({ error: "Name and birth date required" }, { status: 400 });
    }
    const profile = calculateFullProfile(birthDate, name, forDate);
    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ error: "Calculation failed" }, { status: 500 });
  }
}
