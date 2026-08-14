import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const results = await db.select().from(profiles).where(eq(profiles.email, email));

    if (results.length > 0) {
      const token = randomUUID();
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db
        .update(profiles)
        .set({
          resetPasswordToken: token,
          resetPasswordExpires: expires,
        })
        .where(eq(profiles.id, results[0].id));

      await sendPasswordResetEmail(email, token);
    }

    // Always return same message to prevent email enumeration
    return NextResponse.json({ message: "If an account exists, a reset link was sent." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}