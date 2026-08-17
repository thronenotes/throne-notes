"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import {
  Feather,
  Moon,
  Calculator,
  Crown,
  Sparkles,
  ChevronRight,
  BookOpen,
  LogOut,
  LogIn,
  UserPlus,
  Loader2,
  FileText,
  Flame,
  Hash,
} from "lucide-react";

interface Book {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
}

interface Entry {
  id: string;
  title: string | null;
  content: string;
  entryType: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [booksRes, entriesRes] = await Promise.all([
        fetch("/api/books"),
        fetch(`/api/entries?userId=${user?.id || ""}`),
      ]);

      if (booksRes.ok) setBooks(await booksRes.json());
      if (entriesRes.ok) setEntries(await entriesRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const tools = [
    {
      name: "Scribe Studio",
      description: "Chapter-by-chapter writing with revelation linking, scripture sidebar, and sermon mode.",
      icon: Feather,
      href: "/scribe",
      accent: "#D4AF37",
    },
    {
      name: "Dream Vault",
      description: "Journal dreams, visions, and revelations with prophetic tags and spiritual state tracking.",
      icon: Moon,
      href: "/vault",
      accent: "#4B0082",
    },
    {
      name: "Blueprint Engine",
      description: "Calculate Life Path, Expression, Soul Urge, and daily personal numbers instantly.",
      icon: Calculator,
      href: "/numerology",
      accent: "#046307",
    },
    {
      name: "The Oracle",
      description: "Speak your dream. Receive your Kingdom intelligence briefing through prophetic AI.",
      icon: Sparkles,
      href: "/oracle",
      accent: "#B87333",
    },
  ];

  const totalWords = entries.reduce((acc, e) => acc + (e.content?.split(/\s+/).filter((w: string) => w.length > 0).length || 0), 0)
    + books.reduce((acc, b) => acc + 0, 0); // Books word count would need chapters fetch

  const recentEntries = entries.slice(0, 3);
  const recentBooks = books.slice(0, 3);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0A0F" }}>
      {/* Header */}
      <header
        className="border-b sticky top-0 z-50"
        style={{
          backgroundColor: "rgba(20,20,30,0.8)",
          borderColor: "#2A2A3E",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6" style={{ color: "#D4AF37" }} />
            <h1
              className="text-lg tracking-tight"
              style={{ color: "#F5F0E6", fontFamily: "Cinzel, serif" }}
            >
              Throne Notes
            </h1>
          </div>
          <nav className="flex items-center gap-1">
            {user ? (
              <>
                <span className="text-xs text-throne-text-muted mr-2 hidden sm:inline">
                  {user.email}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-throne-text-muted hover:text-throne-crimson hover:bg-throne-crimson/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exit</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-throne-text-muted hover:text-throne-gold hover:bg-throne-surface transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-throne-gold text-throne-bg hover:bg-throne-goldLight transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Claim Throne</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-16">
          <p
            className="text-sm tracking-widest uppercase mb-4"
            style={{ color: "#D4AF37", fontFamily: "Cinzel, serif" }}
          >
            Kingdom Operating System
          </p>
          <h2
            className="text-4xl md:text-5xl leading-tight mb-6"
            style={{ color: "#F5F0E6", fontFamily: "Cinzel, serif" }}
          >
            Your revelations become books.
            <br />
            <span style={{ color: "#D4AF37" }}>Your books become movements.</span>
          </h2>
          <p
            className="text-lg max-w-2xl leading-relaxed"
            style={{ color: "#8A8A9A" }}
          >
            Throne Notes is not a note app. It is your prophetic command center.
            Write with revelation. Capture dreams with discernment. Calculate your
            kingdom blueprint.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.name}
                href={tool.href}
                className="group block p-6 rounded-xl border transition-all hover:-translate-y-1"
                style={{
                  backgroundColor: "rgba(20,20,30,0.4)",
                  borderColor: "#2A2A3E",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = tool.accent + "60";
                  e.currentTarget.style.backgroundColor = "rgba(20,20,30,0.7)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2A2A3E";
                  e.currentTarget.style.backgroundColor = "rgba(20,20,30,0.4)";
                }}
              >
                <div className="mb-4" style={{ color: tool.accent }}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3
                  className="text-lg mb-2 transition-colors group-hover:text-[#D4AF37]"
                  style={{ color: "#F5F0E6", fontFamily: "Cinzel, serif" }}
                >
                  {tool.name}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8A8A9A" }}>
                  {tool.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs" style={{ color: tool.accent }}>
                  <span>Enter</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Live Stats */}
        {user && !loading && (
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <StatCard label="Books in progress" value={String(books.filter((b) => b.status !== "published").length)} />
            <StatCard label="Dreams captured" value={String(entries.length)} />
            <StatCard label="Chapters written" value="—" />
            <StatCard label="Words this week" value={totalWords.toLocaleString()} />
          </div>
        )}

        {user && loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#D4AF37" }} />
          </div>
        )}

        {/* Recent Activity */}
        {user && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Journal Entries */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-heading uppercase tracking-widest" style={{ color: "#8A8A9A", fontFamily: "Cinzel, serif" }}>
                  Recent Journal Entries
                </h3>
                <Link href="/vault" className="text-xs text-throne-gold hover:text-throne-goldLight transition-colors">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {recentEntries.length === 0 && (
                  <p className="text-xs text-throne-text-muted">No entries yet. Start capturing your revelations.</p>
                )}
                {recentEntries.map((entry) => (
                  <Link
                    key={entry.id}
                    href="/vault"
                    className="block p-4 rounded-lg border transition-colors hover:border-throne-gold/30"
                    style={{ backgroundColor: "rgba(20,20,30,0.3)", borderColor: "#2A2A3E" }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="w-3 h-3" style={{ color: "#4B0082" }} />
                      <span className="text-xs text-throne-text-muted capitalize">{entry.entryType}</span>
                    </div>
                    <p className="text-sm text-throne-text truncate">{entry.title || "Untitled Entry"}</p>
                    <p className="text-[11px] text-throne-text-muted mt-1 line-clamp-2">{entry.content}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Books */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-heading uppercase tracking-widest" style={{ color: "#8A8A9A", fontFamily: "Cinzel, serif" }}>
                  Recent Books
                </h3>
                <Link href="/scribe" className="text-xs text-throne-gold hover:text-throne-goldLight transition-colors">
                  Open Scribe
                </Link>
              </div>
              <div className="space-y-3">
                {recentBooks.length === 0 && (
                  <p className="text-xs text-throne-text-muted">No books yet. Start your first manuscript in Scribe Studio.</p>
                )}
                {recentBooks.map((book) => (
                  <Link
                    key={book.id}
                    href="/scribe"
                    className="block p-4 rounded-lg border transition-colors hover:border-throne-gold/30"
                    style={{ backgroundColor: "rgba(20,20,30,0.3)", borderColor: "#2A2A3E" }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-3 h-3" style={{ color: "#D4AF37" }} />
                      <span className="text-xs text-throne-text-muted capitalize">{book.status}</span>
                    </div>
                    <p className="text-sm text-throne-text">{book.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="p-5 rounded-xl border"
      style={{ backgroundColor: "rgba(20,20,30,0.3)", borderColor: "#2A2A3E" }}
    >
      <div
        className="text-2xl mb-1"
        style={{ color: "#F5F0E6", fontFamily: "Cinzel, serif" }}
      >
        {value}
      </div>
      <div
        className="text-xs uppercase tracking-wider"
        style={{ color: "#8A8A9A" }}
      >
        {label}
      </div>
    </div>
  );
}