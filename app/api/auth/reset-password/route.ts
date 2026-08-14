import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq, gt } from "drizzle-orm";
import { createHash } from "crypto";

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password || password.length < 6) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const results = await db
      .select()
      .from(profiles)
      .where(eq(profiles.resetPasswordToken, token));

    if (results.length === 0) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const profile = results[0];
    if (!profile.resetPasswordExpires || new Date(profile.resetPasswordExpires) < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    await db
      .update(profiles)
      .set({
        passwordHash: hashPassword(password),
        resetPasswordToken: null,
        resetPasswordExpires: null,
      })
      .where(eq(profiles.id, profile.id));

    return NextResponse.json({ message: "Password reset successful." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}