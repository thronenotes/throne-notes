import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createHash, randomUUID } from "crypto";
import { sendVerificationEmail } from "@/lib/email";

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: "Email and password (6+ chars) required" }, { status: 400 });
    }

    const existing = await db.select().from(profiles).where(eq(profiles.email, email));
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const verificationToken = randomUUID();

    const [profile] = await db
      .insert(profiles)
      .values({
        email,
        passwordHash: hashPassword(password),
        fullName,
        verificationToken,
      })
      .returning();

    await sendVerificationEmail(email, verificationToken);

    const { passwordHash: _, ...safe } = profile;
    return NextResponse.json({ user: safe, message: "Check your email to verify." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}