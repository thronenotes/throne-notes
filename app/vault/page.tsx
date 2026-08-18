"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Crown, ChevronLeft, Moon, Plus, Mic, MicOff, Search, Filter,
  Lock, Globe, Trash2, Edit3, X, Save, Loader2,
  Sun, Flame, Eye, MessageCircle, BookOpen, Calendar,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface JournalEntry {
  id: string;
  title?: string | null;
  content: string;
  entryType: "dream" | "revelation" | "battle" | "decree" | "teaching";
  spiritualState: "aligned" | "drained" | "anointed" | "warring" | "resting" | "interceding";
  tags: string[];
  dateOccurred: string;
  isPrivate: boolean;
  personalYear?: number | null;
  personalMonth?: number | null;
  personalDay?: number | null;
  createdAt: string;
}

const SPIRITUAL_STATES = [
  { value: "aligned", label: "Aligned", color: "#046307" },
  { value: "drained", label: "Drained", color: "#8A8A9A" },
  { value: "anointed", label: "Anointed", color: "#D4AF37" },
  { value: "warring", label: "Warring", color: "#8B0000" },
  { value: "resting", label: "Resting", color: "#4B0082" },
  { value: "interceding", label: "Interceding", color: "#B87333" },
] as const;

const PROPHETIC_TAGS = [
  "#financial-breakthrough", "#ancestral-cleansing", "#kingdom-building",
  "#warning", "#decree", "#angelic-visit", "#prophetic-word",
  "#healing", "#deliverance", "#covenant",
] as const;

const ENTRY_TYPES = [
  { value: "dream", label: "Dream", icon: Moon, color: "#4B0082" },
  { value: "revelation", label: "Revelation", icon: Sun, color: "#D4AF37" },
  { value: "battle", label: "Battle", icon: Flame, color: "#8B0000" },
  { value: "decree", label: "Decree", icon: BookOpen, color: "#B87333" },
  { value: "teaching", label: "Teaching", icon: MessageCircle, color: "#046307" },
] as const;

export default function DreamVault() {
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filter, setFilter] = useState<JournalEntry["entryType"] | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entryType, setEntryType] = useState<JournalEntry["entryType"]>("dream");
  const [spiritualState, setSpiritualState] = useState<JournalEntry["spiritualState"]>("aligned");
  const [tags, setTags] = useState<string[]>([]);
  const [dateOccurred, setDateOccurred] = useState(new Date().toISOString().split("T")[0]);
  const [isPrivate, setIsPrivate] = useState(true);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/login";
      return;
    }
    if (user) fetchEntries();
  }, [user, authLoading]);

  const fetchEntries = async () => {
    try {
      const res = await fetch(`/api/entries?userId=${user?.id || ""}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error("Failed to fetch entries:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim() || !user) return;
    setSaving(true);
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title: title || null,
          content,
          entryType,
          spiritualState,
          tags,
          dateOccurred,
          isPrivate,
        }),
      });
      if (res.ok) {
        resetComposer();
        setShowComposer(false);
        fetchEntries();
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this entry from the Vault?")) return;
    try {
      await fetch(`/api/entries/${id}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const resetComposer = () => {
    setTitle("");
    setContent("");
    setEntryType("dream");
    setSpiritualState("aligned");
    setTags([]);
    setDateOccurred(new Date().toISOString().split("T")[0]);
    setIsPrivate(true);
  };

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const toggleFilterTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const filtered = entries.filter((e) => {
    if (filter !== "all" && e.entryType !== filter) return false;
    if (selectedTags.length > 0 && !selectedTags.some((t) => e.tags.includes(t))) return false;
    if (search) {
      const q = search.toLowerCase();
      const inTitle = e.title?.toLowerCase().includes(q);
      const inContent = e.content.toLowerCase().includes(q);
      if (!inTitle && !inContent) return false;
    }
    return true;
  });

  const getStateColor = (state: string) =>
    SPIRITUAL_STATES.find((s) => s.value === state)?.color || "#8A8A9A";

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A0A0F" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#D4AF37" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0A0F" }}>
      <header className="border-b sticky top-0 z-40 backdrop-blur-sm" style={{ backgroundColor: "rgba(20,20,30,0.8)", borderColor: "#2A2A3E" }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 transition-colors hover:text-[#D4AF37]" style={{ color: "#8A8A9A" }}>
              <ChevronLeft className="w-4 h-4" />
              <Crown className="w-5 h-5" style={{ color: "#D4AF37" }} />
            </Link>
            <div className="h-6 w-px" style={{ backgroundColor: "#2A2A3E" }} />
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4" style={{ color: "#4B0082" }} />
              <h1 className="text-sm tracking-wider" style={{ color: "#4B0082", fontFamily: "Cinzel, serif" }}>DREAM VAULT</h1>
            </div>
          </div>
          <button onClick={() => setShowComposer(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border"
            style={{ backgroundColor: "rgba(75,0,130,0.1)", borderColor: "rgba(75,0,130,0.3)", color: "#4B0082" }}>
            <Plus className="w-3.5 h-3.5" /> New Entry
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8A8A9A" }} />
            <input type="text" placeholder="Search dreams, visions, revelations..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border outline-none text-sm transition-colors"
              style={{ backgroundColor: "#14141E", borderColor: "#2A2A3E", color: "#F5F0E6" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#4B0082")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#2A2A3E")} />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(["all", "dream", "revelation", "battle", "decree", "teaching"] as const).map((type) => (
              <button key={type} onClick={() => setFilter(type)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all border"
                style={filter === type ? { backgroundColor: `${ENTRY_TYPES.find(t => t.value === type)?.color}15`, borderColor: ENTRY_TYPES.find(t => t.value === type)?.color || "#2A2A3E", color: ENTRY_TYPES.find(t => t.value === type)?.color || "#F5F0E6" } : { backgroundColor: "#0A0A0F", borderColor: "#2A2A3E", color: "#8A8A9A" }}>
                {type === "all" ? "All entries" : `${type}s`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter className="w-3.5 h-3.5" style={{ color: "#8A8A9A" }} />
          {PROPHETIC_TAGS.map((tag) => (
            <button key={tag} onClick={() => toggleFilterTag(tag)}
              className="px-2 py-1 rounded-md text-[10px] font-medium transition-all border"
              style={selectedTags.includes(tag) ? { backgroundColor: "rgba(212,175,55,0.1)", borderColor: "rgba(212,175,55,0.3)", color: "#D4AF37" } : { backgroundColor: "#0A0A0F", borderColor: "#2A2A3E", color: "#8A8A9A" }}>
              {tag}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((entry) => (
            <EntryCard key={entry.id} entry={entry} stateColor={getStateColor(entry.spiritualState)} onDelete={() => handleDelete(entry.id)} />
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Moon className="w-10 h-10 mx-auto mb-4" style={{ color: "#2A2A3E" }} />
            <p className="text-sm" style={{ color: "#8A8A9A" }}>No entries found. Start capturing your revelations.</p>
          </div>
        )}
      </main>

      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(10,10,15,0.8)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl"
            style={{ backgroundColor: "#14141E", borderColor: "#2A2A3E" }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "#2A2A3E" }}>
              <h2 className="text-sm" style={{ color: "#F5F0E6", fontFamily: "Cinzel, serif" }}>New Journal Entry</h2>
              <button onClick={() => { resetComposer(); setShowComposer(false); }}
                className="p-1.5 rounded-lg transition-colors" style={{ color: "#8A8A9A" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1E1E2A"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex gap-2 flex-wrap">
                {ENTRY_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button key={type.value} onClick={() => setEntryType(type.value)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border"
                      style={entryType === type.value ? { backgroundColor: `${type.color}15`, borderColor: type.color, color: type.color } : { backgroundColor: "#0A0A0F", borderColor: "#2A2A3E", color: "#8A8A9A" }}>
                      <Icon className="w-3 h-3" /> {type.label}
                    </button>
                  );
                })}
              </div>

              <input type="text" placeholder="Title (optional)..." value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border outline-none transition-colors text-sm"
                style={{ backgroundColor: "#0A0A0F", borderColor: "#2A2A3E", color: "#F5F0E6" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#4B0082")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2A2A3E")} />

              <div className="relative">
                <textarea placeholder="Write your revelation..." value={content} onChange={(e) => setContent(e.target.value)} rows={8}
                  className="w-full px-4 py-3 rounded-lg border outline-none transition-colors resize-none text-sm leading-relaxed"
                  style={{ backgroundColor: "#0A0A0F", borderColor: "#2A2A3E", color: "#F5F0E6" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#4B0082")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2A2A3E")} />
                <button onClick={() => setRecording(!recording)}
                  className="absolute bottom-3 right-3 p-2 rounded-lg transition-colors"
                  style={{ backgroundColor: recording ? "rgba(139,0,0,0.2)" : "rgba(42,42,62,0.5)", color: recording ? "#8B0000" : "#8A8A9A" }}>
                  {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest mb-2" style={{ color: "#8A8A9A", fontFamily: "Cinzel, serif" }}>
                  <Calendar className="w-3 h-3" /> Date Occurred
                </label>
                <input type="date" value={dateOccurred} onChange={(e) => setDateOccurred(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border outline-none text-sm transition-colors"
                  style={{ backgroundColor: "#0A0A0F", borderColor: "#2A2A3E", color: "#F5F0E6" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#4B0082")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2A2A3E")} />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest mb-2 block" style={{ color: "#8A8A9A", fontFamily: "Cinzel, serif" }}>Spiritual State</label>
                <div className="flex gap-2 flex-wrap">
                  {SPIRITUAL_STATES.map((state) => (
                    <button key={state.value} onClick={() => setSpiritualState(state.value)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all border"
                      style={spiritualState === state.value ? { backgroundColor: `${state.color}15`, borderColor: state.color, color: state.color } : { backgroundColor: "#0A0A0F", borderColor: "#2A2A3E", color: "#8A8A9A" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: state.color }} /> {state.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest mb-2 block" style={{ color: "#8A8A9A", fontFamily: "Cinzel, serif" }}>Prophetic Tags</label>
                <div className="flex gap-2 flex-wrap">
                  {PROPHETIC_TAGS.map((tag) => (
                    <button key={tag} onClick={() => toggleTag(tag)}
                      className="px-2 py-1 rounded-md text-[10px] font-medium transition-all border"
                      style={tags.includes(tag) ? { backgroundColor: "rgba(212,175,55,0.1)", borderColor: "rgba(212,175,55,0.3)", color: "#D4AF37" } : { backgroundColor: "#0A0A0F", borderColor: "#2A2A3E", color: "#8A8A9A" }}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => setIsPrivate(!isPrivate)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all border"
                  style={isPrivate ? { backgroundColor: "rgba(139,0,0,0.1)", borderColor: "rgba(139,0,0,0.3)", color: "#8B0000" } : { backgroundColor: "rgba(4,99,7,0.1)", borderColor: "rgba(4,99,7,0.3)", color: "#046307" }}>
                  {isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />} {isPrivate ? "Private" : "Public"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 border-t" style={{ borderColor: "#2A2A3E" }}>
              <span className="text-xs" style={{ color: "#8A8A9A" }}>{content.split(/\s+/).filter((w) => w.length > 0).length} words</span>
              <div className="flex gap-2">
                <button onClick={() => { resetComposer(); setShowComposer(false); }}
                  className="px-4 py-2 rounded-lg text-xs transition-colors" style={{ color: "#8A8A9A" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#F5F0E6")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8A9A")}>Cancel</button>
                <button onClick={handleSave} disabled={!content.trim() || saving}
                  className="px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ backgroundColor: saving ? "#2A2A3E" : "#D4AF37", color: saving ? "#8A8A9A" : "#0A0A0F" }}>
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {saving ? "Sealing..." : "Save Entry"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EntryCard({ entry, stateColor, onDelete }: { entry: JournalEntry; stateColor: string; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const typeConfig = ENTRY_TYPES.find((t) => t.value === entry.entryType);
  const TypeIcon = typeConfig?.icon || Moon;

  return (
    <div className="group p-5 rounded-xl border transition-all hover:border-[#2A2A3E]"
      style={{ backgroundColor: "rgba(20,20,30,0.4)", borderColor: "#2A2A3E" }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stateColor }} />
          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: "#8A8A9A" }}>
            <TypeIcon className="w-3 h-3" style={{ color: typeConfig?.color }} /> {entry.entryType}
          </span>
          {entry.isPrivate ? <Lock className="w-3 h-3" style={{ color: "#8A8A9A" }} /> : <Globe className="w-3 h-3" style={{ color: "#046307" }} />}
        </div>
        <span className="text-[10px] tabular-nums" style={{ color: "#8A8A9A" }}>
          {new Date(entry.dateOccurred).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      {entry.title && <h3 className="text-sm mb-2" style={{ color: "#F5F0E6", fontFamily: "Cinzel, serif" }}>{entry.title}</h3>}

      <p className={`text-xs leading-relaxed mb-3 ${expanded ? "" : "line-clamp-3"}`} style={{ color: "#8A8A9A" }}>{entry.content}</p>

      {!expanded && entry.content.length > 180 && (
        <button onClick={() => setExpanded(true)} className="text-[10px] mb-2 transition-colors hover:text-[#F0D878]" style={{ color: "#D4AF37" }}>Read more</button>
      )}

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {entry.tags.map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] border" style={{ backgroundColor: "rgba(10,10,15,0.6)", borderColor: "#2A2A3E", color: "#8A8A9A" }}>{tag}</span>
          ))}
        </div>
      )}

      {(entry.personalYear || entry.personalMonth || entry.personalDay) && (
        <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: "#2A2A3E" }}>
          {entry.personalYear && <span className="text-[10px]" style={{ color: "#8A8A9A" }}>Year: <span className="font-medium" style={{ color: "#F5F0E6" }}>{entry.personalYear}</span></span>}
          {entry.personalMonth && <span className="text-[10px]" style={{ color: "#8A8A9A" }}>Month: <span className="font-medium" style={{ color: "#F5F0E6" }}>{entry.personalMonth}</span></span>}
          {entry.personalDay && <span className="text-[10px]" style={{ color: "#8A8A9A" }}>Day: <span className="font-medium" style={{ color: "#F5F0E6" }}>{entry.personalDay}</span></span>}
        </div>
      )}

      <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1.5 rounded transition-colors" style={{ color: "#8A8A9A" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1E1E2A"; e.currentTarget.style.color = "#F5F0E6"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#8A8A9A"; }}>
          <Edit3 className="w-3 h-3" />
        </button>
        <button onClick={onDelete}
          className="p-1.5 rounded transition-colors" style={{ color: "#8A8A9A" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(139,0,0,0.1)"; e.currentTarget.style.color = "#8B0000"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#8A8A9A"; }}>
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}