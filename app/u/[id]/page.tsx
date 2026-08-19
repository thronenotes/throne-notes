"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Crown, BookOpen, Loader2, User, ArrowLeft } from "lucide-react";

export default function AuthorPage() {
  const params = useParams();
  const id = params.id as string;
  const [author, setAuthor] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    const [profileRes, booksRes] = await Promise.all([
      fetch(`/api/profile?userId=${id}`),
      fetch(`/api/books/public?authorId=${id}`),
    ]);
    if (profileRes.ok) setAuthor(await profileRes.json());
    if (booksRes.ok) setBooks(await booksRes.json());
    setLoading(false);
  };

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
        <div className="flex items-center gap-4 mb-10">
          <div
            className="w-16 h-16 rounded-full border flex items-center justify-center"
            style={{ borderColor: "#2A2A3E", backgroundColor: "#14141E" }}
          >
            <User className="w-8 h-8" style={{ color: "#8A8A9A" }} />
          </div>
          <div>
            <h1 className="text-2xl" style={{ color: "#F5F0E6", fontFamily: "Cinzel, serif" }}>
              {author?.displayName || author?.fullName || "Unknown Scribe"}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#8A8A9A" }}>
              {author?.bio || "Kingdom scribe and revelator"}
            </p>
          </div>
        </div>

        {/* Published Works */}
        <h2 className="text-xs uppercase tracking-widest mb-4" style={{ color: "#8A8A9A", fontFamily: "Cinzel, serif" }}>
          Published Works
        </h2>

        {books.length === 0 ? (
          <p className="text-sm" style={{ color: "#8A8A9A" }}>
            No published works yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.slug}`}
                className="p-5 rounded-xl border transition-all hover:border-[#D4AF3750] group"
                style={{ backgroundColor: "rgba(20,20,30,0.4)", borderColor: "#2A2A3E" }}
              >
                <BookOpen className="w-5 h-5 mb-3 transition-colors group-hover:text-[#D4AF37]" style={{ color: "#8A8A9A" }} />
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