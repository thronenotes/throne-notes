"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Crown, BookOpen, Loader2, User, ArrowLeft,
  Users, UserPlus, UserCheck, Lock,
} from "lucide-react";

export default function AuthorPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const [author, setAuthor] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    if (user && id) checkFollowStatus();
  }, [user, id]);

  const fetchData = async () => {
    const [profileRes, booksRes, countsRes] = await Promise.all([
      fetch(`/api/profile?userId=${id}`),
      fetch(`/api/books/public?authorId=${id}`),
      fetch(`/api/follow?profileId=${id}`),
    ]);
    if (profileRes.ok) setAuthor(await profileRes.json());
    if (booksRes.ok) setBooks(await booksRes.json());
    if (countsRes.ok) setFollowCounts(await countsRes.json());
    setLoading(false);
  };

  const checkFollowStatus = async () => {
    if (!user || user.id === id) return;
    const res = await fetch(`/api/follow?followerId=${user.id}&followingId=${id}`);
    if (res.ok) {
      const data = await res.json();
      setIsFollowing(data.isFollowing);
    }
  };

  const toggleFollow = async () => {
    if (!user || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await fetch(`/api/follow?followerId=${user.id}&followingId=${id}`, { method: "DELETE" });
        setIsFollowing(false);
        setFollowCounts((prev) => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));
      } else {
        await fetch("/api/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followerId: user.id, followingId: id }),
        });
        setIsFollowing(true);
        setFollowCounts((prev) => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFollowLoading(false);
    }
  };

  const isOwnProfile = user?.id === id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A0A0F" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#D4AF37" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0A0F" }}>
      <header className="border-b" style={{ borderColor: "#2A2A3E" }}>
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 transition-colors hover:text-[#D4AF37]" style={{ color: "#8A8A9A" }}>
            <ArrowLeft className="w-4 h-4" />
            <Crown className="w-5 h-5" style={{ color: "#D4AF37" }} />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Author Header */}
        <div className="flex items-start gap-5 mb-10">
          <div
            className="w-20 h-20 rounded-full border flex items-center justify-center shrink-0"
            style={{ borderColor: "#2A2A3E", backgroundColor: "#14141E" }}
          >
            <User className="w-10 h-10" style={{ color: "#8A8A9A" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl" style={{ color: "#F5F0E6", fontFamily: "Cinzel, serif" }}>
              {author?.displayName || author?.fullName || "Unknown Scribe"}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#8A8A9A" }}>
              {author?.bio || "Kingdom scribe and revelator"}
            </p>

            {/* Follow counts */}
            <div className="flex items-center gap-4 mt-3">
              <span className="text-xs" style={{ color: "#8A8A9A" }}>
                <span className="font-medium" style={{ color: "#F5F0E6" }}>{followCounts.followers}</span> followers
              </span>
              <span className="text-xs" style={{ color: "#8A8A9A" }}>
                <span className="font-medium" style={{ color: "#F5F0E6" }}>{followCounts.following}</span> following
              </span>
            </div>

            {/* Follow button */}
            {!isOwnProfile && user && (
              <button
                onClick={toggleFollow}
                disabled={followLoading}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-40 border"
                style={
                  isFollowing
                    ? { backgroundColor: "rgba(20,20,30,0.6)", borderColor: "#2A2A3E", color: "#8A8A9A" }
                    : { backgroundColor: "rgba(212,175,55,0.15)", borderColor: "rgba(212,175,55,0.3)", color: "#D4AF37" }
                }
              >
                {followLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isFollowing ? (
                  <><UserCheck className="w-3.5 h-3.5" /> Following</>
                ) : (
                  <><UserPlus className="w-3.5 h-3.5" /> Follow</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Published Works */}
        <h2 className="text-xs uppercase tracking-widest mb-4" style={{ color: "#8A8A9A", fontFamily: "Cinzel, serif" }}>
          Published Works
        </h2>

        {books.length === 0 ? (
          <p className="text-sm" style={{ color: "#8A8A9A" }}>No published works yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.slug}`}
                className="p-5 rounded-xl border transition-all hover:border-[#D4AF3750] group"
                style={{ backgroundColor: "rgba(20,20,30,0.4)", borderColor: "#2A2A3E" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <BookOpen className="w-5 h-5 transition-colors group-hover:text-[#D4AF37]" style={{ color: "#8A8A9A" }} />
                  {!book.priceDigital || parseFloat(book.priceDigital) === 0 ? (
                    <span className="text-[9px] px-2 py-0.5 rounded border" style={{ borderColor: "#04630730", color: "#046307" }}>FREE</span>
                  ) : (
                    <span className="text-[9px] px-2 py-0.5 rounded border flex items-center gap-1" style={{ borderColor: "#D4AF3730", color: "#D4AF37" }}>
                      <Lock className="w-3 h-3" /> ${book.priceDigital}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-medium mb-1" style={{ color: "#F5F0E6" }}>
                  {book.title}
                </h3>
                <p className="text-xs line-clamp-2" style={{ color: "#8A8A9A" }}>
                  {book.subtitle || book.description || "No description"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}