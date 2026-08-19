import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { followers } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";

// POST /api/follow  → follow someone
export async function POST(req: NextRequest) {
  try {
    const { followerId, followingId } = await req.json();
    if (!followerId || !followingId) {
      return NextResponse.json({ error: "Missing ids" }, { status: 400 });
    }
    if (followerId === followingId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }
    await db.insert(followers).values({ followerId, followingId }).onConflictDoNothing();
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to follow" }, { status: 500 });
  }
}

// DELETE /api/follow?followerId=X&followingId=Y  → unfollow
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const followerId = searchParams.get("followerId");
    const followingId = searchParams.get("followingId");
    if (!followerId || !followingId) {
      return NextResponse.json({ error: "Missing ids" }, { status: 400 });
    }
    await db.delete(followers).where(
      and(eq(followers.followerId, followerId), eq(followers.followingId, followingId))
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to unfollow" }, { status: 500 });
  }
}

// GET /api/follow?followerId=X&followingId=Y  → check status + counts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const followerId = searchParams.get("followerId");
    const followingId = searchParams.get("followingId");
    const profileId = searchParams.get("profileId");

    if (followerId && followingId) {
      const result = await db.select().from(followers).where(
        and(eq(followers.followerId, followerId), eq(followers.followingId, followingId))
      );
      return NextResponse.json({ isFollowing: result.length > 0 });
    }

    if (profileId) {
      const [followersCount] = await db.select({ count: count() }).from(followers).where(eq(followers.followingId, profileId));
      const [followingCount] = await db.select({ count: count() }).from(followers).where(eq(followers.followerId, profileId));
      return NextResponse.json({
        followers: followersCount.count,
        following: followingCount.count,
      });
    }

    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}