import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq, isNull } from "drizzle-orm";
import { randomUUID } from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const results = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, email));

    if (results.length === 0) {
      return NextResponse.json({ message: "If an account exists, a new link was sent." });
    }

    const profile = results[0];
    if (profile.emailVerified) {
      return NextResponse.json({ message: "Email already verified." });
    }

    const newToken = randomUUID();
    await db
      .update(profiles)
      .set({ verificationToken: newToken })
      .where(eq(profiles.id, profile.id));

    await sendVerificationEmail(email, newToken);

    return NextResponse.json({ message: "Verification email resent." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to resend" }, { status: 500 });
  }
}