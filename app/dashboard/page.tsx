"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Crown,
  Feather,
  Moon,
  Calculator,
  Sparkles,
  BookOpen,
  LogOut,
  ArrowRight,
  Flame,
  Loader2,
  PenLine,
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
  const { user, loading: authLoading, logout } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }
    fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const [booksRes, entriesRes] = await Promise.all([
        fetch(`/api/books?userId=${user?.id || ""}`),
        fetch(`/api/entries?userId=${user?.id || ""}`),
      ]);
      if (booksRes.ok) {
        const b = await booksRes.json();
        setBooks(Array.isArray(b) ? b : []);
      } else {
        console.error("Books fetch failed:", booksRes.status);
      }
      if (entriesRes.ok) {
        const e = await entriesRes.json();
        setEntries(Array.isArray(e) ? e : []);
      } else {
        console.error("Entries fetch failed:", entriesRes.status);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const firstName =
    user?.name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "King";

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const entriesThisWeek = entries.filter(
    (e) => new Date(e.createdAt) > weekAgo
  ).length;
  const booksInProgress = books.filter((b) => b.status !== "published").length;
  const dreamsRecorded = entries.filter((e) => e.entryType === "dream").length;

  const recentEntries = entries.slice(0, 5);
  const lastBook = books[0];

  const shortcuts = [
    { name: "Scribe Studio", href: "/scribe", icon: Feather, color: "#D4AF37" },
    { name: "Dream Vault", href: "/vault", icon: Moon, color: "#4B0082" },
    { name: "Blueprint Engine", href: "/numerology", icon: Calculator, color: "#046307" },
    { name: "The Oracle", href: "/oracle", icon: Sparkles, color: "#B87333" },
  ];

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A0A0F" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#D4AF37" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0A0F" }}>
      {/* Header */}
      <header
        className="border-b sticky top-0 z-50"
        style={{ backgroundColor: "rgba(20,20,30,0.8)", borderColor: "#2A2A3E", backdropFilter: "blur(8px)" }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5" style={{ color: "#D4AF37" }} />
            <span className="text-sm tracking-wider" style={{ color: "#F5F0E6", fontFamily: "Cinzel, serif" }}>
              THRONE ROOM
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-throne-text-muted hidden sm:inline">{user.email}</span>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-throne-text-muted hover:text-throne-crimson hover:bg-throne-crimson/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#8A8A9A", fontFamily: "Cinzel, serif" }}>
            Kingdom Operating System
          </p>
          <h1 className="text-3xl md:text-4xl" style={{ color: "#F5F0E6", fontFamily: "Cinzel, serif" }}>
            Welcome back, <span style={{ color: "#D4AF37" }}>{firstName}</span>
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatBox label="Entries this week" value={entriesThisWeek} />
          <StatBox label="Books in progress" value={booksInProgress} />
          <StatBox label="Dreams recorded" value={dreamsRecorded} />
          <StatBox label="Total entries" value={entries.length} />
        </div>

        {/* Continue Writing */}
        {lastBook && (
          <div
            className="p-5 rounded-xl border mb-10 flex items-center justify-between"
            style={{ backgroundColor: "rgba(212,175,55,0.05)", borderColor: "rgba(212,175,55,0.2)" }}
          >
            <div>
              <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#D4AF37", fontFamily: "Cinzel, serif" }}>
                Continue Writing
              </div>
              <div className="text-sm font-medium" style={{ color: "#F5F0E6" }}>
                {lastBook.title}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "#8A8A9A" }}>
                {lastBook.status === "draft" ? "Draft — keep building" : "In progress"}
              </div>
            </div>
            <Link
              href="/scribe"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
              style={{ backgroundColor: "#D4AF37", color: "#0A0A0F" }}
            >
              <PenLine className="w-3.5 h-3.5" /> Open Scribe
            </Link>
          </div>
        )}

        {/* Shortcuts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {shortcuts.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.name}
                href={s.href}
                className="p-4 rounded-xl border transition-colors"
                style={{ backgroundColor: "rgba(20,20,30,0.4)", borderColor: "#2A2A3E" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = s.color + "60";
                  e.currentTarget.style.backgroundColor = "rgba(20,20,30,0.7)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2A2A3E";
                  e.currentTarget.style.backgroundColor = "rgba(20,20,30,0.4)";
                }}
              >
                <Icon className="w-5 h-5 mb-3" style={{ color: s.color }} />
                <div className="text-xs font-medium" style={{ color: "#F5F0E6" }}>
                  {s.name}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Journal Entries (from Vault) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase tracking-widest" style={{ color: "#8A8A9A", fontFamily: "Cinzel, serif" }}>
              Recent Journal Entries
            </h2>
            <Link href="/vault" className="text-xs text-throne-gold hover:text-throne-goldLight transition-colors flex items-center gap-1">
              All entries <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentEntries.length === 0 ? (
            <div className="p-6 rounded-xl border text-center" style={{ backgroundColor: "rgba(20,20,30,0.3)", borderColor: "#2A2A3E" }}>
              <Moon className="w-6 h-6 mx-auto mb-2" style={{ color: "#2A2A3E" }} />
              <p className="text-xs text-throne-text-muted">No entries yet. Capture your first revelation.</p>
              <Link href="/vault" className="text-xs text-throne-gold mt-2 inline-block hover:underline">
                Open Vault
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentEntries.map((entry) => (
                <Link
                  key={entry.id}
                  href="/vault"
                  className="block p-4 rounded-lg border transition-colors hover:border-throne-gold/30"
                  style={{ backgroundColor: "rgba(20,20,30,0.3)", borderColor: "#2A2A3E" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Flame className="w-3.5 h-3.5" style={{ color: "#4B0082" }} />
                      <span className="text-sm text-throne-text truncate max-w-[200px] sm:max-w-md">
                        {entry.title || "Untitled Entry"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded border" style={{ borderColor: "#2A2A3E", color: "#8A8A9A" }}>
                        {entry.entryType}
                      </span>
                    </div>
                    <span className="text-[10px] text-throne-text-muted">
                      {new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="text-xs text-throne-text-muted mt-2 line-clamp-1">{entry.content}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 rounded-xl border" style={{ backgroundColor: "rgba(20,20,30,0.3)", borderColor: "#2A2A3E" }}>
      <div className="text-2xl mb-1" style={{ color: "#F5F0E6", fontFamily: "Cinzel, serif" }}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8A8A9A" }}>
        {label}
      </div>
    </div>
  );
}