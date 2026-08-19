"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Crown, ChevronLeft, Loader2, BookOpen, Flame, User,
  Clock, Lock, ArrowRight,
} from "lucide-react";

interface FeedItem {
  type: "book" | "entry";
  id: string;
  title: string;
  subtitle?: string | null;
  slug?: string | null;
  content?: string;
  entryType?: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  priceDigital?: string | null;
}

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/login";
      return;
    }
    if (user) fetchFeed();
  }, [user, authLoading]);

  const fetchFeed = async () => {
    try {
      const res = await fetch(`/api/feed?userId=${user?.id}`);
      if (res.ok) setItems(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A0A0F" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#D4AF37" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0A0F" }}>
      <header className="border-b sticky top-0 z-40" style={{ backgroundColor: "rgba(20,20,30,0.8)", borderColor: "#2A2A3E", backdropFilter: "blur(8px)" }}>
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 transition-colors hover:text-[#D4AF37]" style={{ color: "#8A8A9A" }}>
            <ChevronLeft className="w-4 h-4" />
            <Crown className="w-5 h-5" style={{ color: "#D4AF37" }} />
          </Link>
          <div className="h-6 w-px" style={{ backgroundColor: "#2A2A3E" }} />
          <h1 className="text-sm tracking-wider" style={{ color: "#F5F0E6", fontFamily: "Cinzel, serif" }}>KINGDOM FEED</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <User className="w-10 h-10 mx-auto mb-4" style={{ color: "#2A2A3E" }} />
            <p className="text-sm" style={{ color: "#8A8A9A" }}>Your feed is empty.</p>
            <p className="text-xs mt-1" style={{ color: "#5A5A6A" }}>Follow authors to see their books and revelations here.</p>
            <Link href="/" className="text-xs text-throne-gold mt-4 inline-block hover:underline">
              Discover authors on the homepage
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={`${item.type}-${item.id}`} className="p-4 rounded-xl border transition-colors hover:border-[#2A2A3E]" style={{ backgroundColor: "rgba(20,20,30,0.4)", borderColor: "#2A2A3E" }}>
                {/* Author header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full border flex items-center justify-center" style={{ borderColor: "#2A2A3E" }}>
                    <User className="w-3 h-3" style={{ color: "#8A8A9A" }} />
                  </div>
                  <Link href={`/u/${item.authorId}`} className="text-xs font-medium hover:text-[#D4AF37] transition-colors" style={{ color: "#F5F0E6" }}>
                    {item.authorName}
                  </Link>
                  <span className="text-[10px]" style={{ color: "#5A5A6A" }}>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>

                {item.type === "book" ? (
                  <Link href={`/books/${item.slug}`} className="block group">
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 mt-0.5 shrink-0 transition-colors group-hover:text-[#D4AF37]" style={{ color: "#8A8A9A" }} />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium transition-colors group-hover:text-[#D4AF37]" style={{ color: "#F5F0E6" }}>
                          {item.title}
                        </h3>
                        {item.subtitle && <p className="text-xs mt-0.5" style={{ color: "#8A8A9A" }}>{item.subtitle}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          {!item.priceDigital || parseFloat(item.priceDigital) === 0 ? (
                            <span className="text-[10px] px-2 py-0.5 rounded border" style={{ borderColor: "#04630730", color: "#046307" }}>FREE</span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded border flex items-center gap-1" style={{ borderColor: "#D4AF3730", color: "#D4AF37" }}>
                              <Lock className="w-3 h-3" /> ${item.priceDigital}
                            </span>
                          )}
                          <span className="text-[10px] flex items-center gap-1" style={{ color: "#5A5A6A" }}>
                            Read <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <Link href={`/u/${item.authorId}`} className="block group">
                    <div className="flex items-start gap-3">
                      <Flame className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#4B0082" }} />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium" style={{ color: "#F5F0E6" }}>{item.title}</h3>
                        <p className="text-xs mt-1 line-clamp-2" style={{ color: "#8A8A9A" }}>{item.content}</p>
                        <span className="text-[10px] mt-2 inline-block px-2 py-0.5 rounded border" style={{ borderColor: "#2A2A3E", color: "#8A8A9A" }}>
                          {item.entryType}
                        </span>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}