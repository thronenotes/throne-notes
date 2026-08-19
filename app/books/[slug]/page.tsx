"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Crown, ChevronLeft, BookOpen, User, Calendar, Loader2,
  ArrowLeft, ArrowRight, Lock, Unlock,
} from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
}

interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  slug: string;
  publishedAt: string;
  priceDigital: string | null;
  creatorId: string;
}

interface Author {
  name: string;
  id: string;
  bio: string | null;
}

export default function BookReader() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [author, setAuthor] = useState<Author | null>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (slug) fetchBook();
  }, [slug]);

  useEffect(() => {
    if (book && user) checkAccess();
    else if (book && !user) {
      // Not logged in: free books OK, paid books = no access
      const isFree = !book.priceDigital || parseFloat(book.priceDigital) === 0;
      setHasAccess(isFree);
      setCheckingAccess(false);
    }
  }, [book, user]);

  const fetchBook = async () => {
    try {
      const res = await fetch(`/api/books/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setBook(data.book);
        setChapters(data.chapters || []);
        setAuthor(data.author);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkAccess = async () => {
    if (!book || !user) return;
    try {
      const res = await fetch(`/api/books/purchase/check?userId=${user.id}&bookId=${book.id}`);
      if (res.ok) {
        const data = await res.json();
        setHasAccess(data.hasAccess);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingAccess(false);
    }
  };

  const handleUnlock = async () => {
    if (!book || !user) {
      window.location.href = "/login";
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id, buyerId: user.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout failed. Try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Checkout failed.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const isFree = book && (!book.priceDigital || parseFloat(book.priceDigital) === 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A0A0F" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#D4AF37" }} />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A0A0F", color: "#F5F0E6" }}>
        Book not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0A0F", color: "#F5F0E6" }}>
      {/* Header */}
      <header className="border-b sticky top-0 z-40" style={{ backgroundColor: "rgba(10,10,15,0.95)", borderColor: "#2A2A3E", backdropFilter: "blur(8px)" }}>
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 transition-colors hover:text-[#D4AF37]" style={{ color: "#8A8A9A" }}>
              <ChevronLeft className="w-4 h-4" />
              <Crown className="w-5 h-5" style={{ color: "#D4AF37" }} />
            </Link>
            <div className="h-6 w-px" style={{ backgroundColor: "#2A2A3E" }} />
            <span className="text-sm truncate max-w-[200px] sm:max-w-md" style={{ fontFamily: "Cinzel, serif" }}>
              {book.title}
            </span>
          </div>
          <Link href={`/u/${author?.id}`} className="text-xs flex items-center gap-2 transition-colors hover:text-[#D4AF37]" style={{ color: "#8A8A9A" }}>
            <User className="w-3 h-3" />
            {author?.name}
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 flex gap-8">
        {/* Chapter Sidebar */}
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="sticky top-24">
            <h3 className="text-xs uppercase tracking-widest mb-4" style={{ color: "#8A8A9A", fontFamily: "Cinzel, serif" }}>
              Chapters
            </h3>
            <div className="space-y-1">
              {chapters.map((ch, i) => (
                <button
                  key={ch.id}
                  onClick={() => hasAccess && setActiveChapter(i)}
                  disabled={!hasAccess}
                  className="w-full text-left px-3 py-2 rounded-md text-xs transition-all disabled:opacity-40"
                  style={
                    activeChapter === i
                      ? { backgroundColor: "rgba(212,175,55,0.1)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.2)" }
                      : { color: "#8A8A9A" }
                  }
                >
                  <div className="flex items-center gap-2">
                    {!hasAccess && <Lock className="w-3 h-3" />}
                    {ch.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Book Header */}
          <div className="mb-8 pb-8 border-b" style={{ borderColor: "#2A2A3E" }}>
            <h1 className="text-3xl mb-3" style={{ fontFamily: "Cinzel, serif", color: "#F5F0E6" }}>
              {book.title}
            </h1>
            {book.subtitle && <p className="text-lg mb-4" style={{ color: "#8A8A9A" }}>{book.subtitle}</p>}
            <div className="flex items-center gap-4 text-xs" style={{ color: "#8A8A9A" }}>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {author?.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(book.publishedAt).toLocaleDateString()}
              </span>
              {!isFree && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded border" style={{ borderColor: "#D4AF3730", color: "#D4AF37" }}>
                  <Lock className="w-3 h-3" /> ${book.priceDigital}
                </span>
              )}
            </div>
          </div>

          {/* Paywall or Content */}
          {checkingAccess ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#D4AF37" }} />
            </div>
          ) : hasAccess ? (
            <>
              {chapters[activeChapter] && (
                <article>
                  <h2 className="text-xl mb-6" style={{ fontFamily: "Cinzel, serif", color: "#D4AF37" }}>
                    {chapters[activeChapter].title}
                  </h2>
                  <div
                    className="text-sm leading-relaxed space-y-4"
                    style={{ color: "#B0B0B0", fontFamily: "Inter, sans-serif" }}
                    dangerouslySetInnerHTML={{ __html: chapters[activeChapter].content }}
                  />
                </article>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-12 pt-6 border-t" style={{ borderColor: "#2A2A3E" }}>
                <button
                  onClick={() => setActiveChapter(Math.max(0, activeChapter - 1))}
                  disabled={activeChapter === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border text-xs transition-colors disabled:opacity-30"
                  style={{ borderColor: "#2A2A3E", color: "#8A8A9A" }}
                >
                  <ArrowLeft className="w-3 h-3" /> Previous
                </button>
                <span className="text-xs" style={{ color: "#8A8A9A" }}>
                  {activeChapter + 1} / {chapters.length}
                </span>
                <button
                  onClick={() => setActiveChapter(Math.min(chapters.length - 1, activeChapter + 1))}
                  disabled={activeChapter === chapters.length - 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border text-xs transition-colors disabled:opacity-30"
                  style={{ borderColor: "#2A2A3E", color: "#8A8A9A" }}
                >
                  Next <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </>
          ) : (
            /* PAYWALL */
            <div className="py-16 text-center">
              <Lock className="w-12 h-12 mx-auto mb-4" style={{ color: "#D4AF37" }} />
              <h3 className="text-lg mb-2" style={{ fontFamily: "Cinzel, serif", color: "#F5F0E6" }}>
                This manuscript is locked
              </h3>
              <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "#8A8A9A" }}>
                Purchase this book to unlock all chapters and read the full revelation.
              </p>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-3xl" style={{ color: "#D4AF37", fontFamily: "Cinzel, serif" }}>
                  ${book.priceDigital}
                </span>
                <span className="text-xs" style={{ color: "#8A8A9A" }}>one-time unlock</span>
              </div>
              <button
                onClick={handleUnlock}
                disabled={checkoutLoading}
                className="px-6 py-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-40 flex items-center gap-2 mx-auto"
                style={{ backgroundColor: "#D4AF37", color: "#0A0A0F" }}
              >
                {checkoutLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Unlock className="w-4 h-4" />
                )}
                {checkoutLoading ? "Redirecting..." : user ? "Unlock Manuscript" : "Sign In to Unlock"}
              </button>
              {!user && (
                <p className="text-xs mt-3" style={{ color: "#5A5A6A" }}>
                  You need an account to purchase. <Link href="/register" className="text-throne-gold hover:underline">Claim your throne</Link>.
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}