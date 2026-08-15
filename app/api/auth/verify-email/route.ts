import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", process.env.NEXT_PUBLIC_APP_URL));
    }

    const results = await db.select().from(profiles).where(eq(profiles.verificationToken, token));
    if (results.length === 0) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", process.env.NEXT_PUBLIC_APP_URL));
    }

    const profile = results[0];

    await db
      .update(profiles)
      .set({
        emailVerified: new Date(),
        verificationToken: null,
      })
      .where(eq(profiles.id, profile.id));

    // Send welcome email after successful verification
    await sendWelcomeEmail(profile.email, profile.fullName);

    return NextResponse.redirect(new URL("/login?verified=1", process.env.NEXT_PUBLIC_APP_URL));
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL("/login?error=server", process.env.NEXT_PUBLIC_APP_URL));
  }
}