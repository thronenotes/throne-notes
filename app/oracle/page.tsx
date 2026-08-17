"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  ChevronLeft,
  Crown,
  Sparkles,
  Mic,
  MicOff,
  Loader2,
  Save,
  Send,
  Volume2,
} from "lucide-react";

const dreamTags = [
  { value: "warfare", label: "Warfare", color: "#8B0000" },
  { value: "family", label: "Family", color: "#D4AF37" },
  { value: "celebrity", label: "Celebrity", color: "#4B0082" },
  { value: "business", label: "Business", color: "#046307" },
  { value: "warning", label: "Warning", color: "#B87333" },
  { value: "assignment", label: "Assignment", color: "#4B0082" },
  { value: "download", label: "Download", color: "#D4AF37" },
];

interface OracleResult {
  symbols: { symbol: string; meaning: string }[];
  meaning: string;
  message: string;
  action: string;
  decree: string;
}

export default function OraclePage() {
  const { user } = useAuth();
  const [dream, setDream] = useState("");
  const [title, setTitle] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OracleResult | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleInterpret = async () => {
    if (!dream.trim()) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    setResult(null);
    setSaved(false);

    try {
      const res = await fetch("/api/dream-oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dreamText: dream,
          userId: user.id,
          tags: selectedTags,
          title: title || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.translation);
        setEntryId(data.entryId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToVault = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSpeakDecree = () => {
    if (!result?.decree) return;
    const utterance = new SpeechSynthesisUtterance(result.decree);
    utterance.rate = 0.85;
    utterance.pitch = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0A0F" }}>
      <header
        className="border-b sticky top-0 z-40 backdrop-blur-sm"
        style={{ borderColor: "#2A2A3E", backgroundColor: "rgba(20,20,30,0.8)" }}
      >
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 transition-colors hover:text-[#D4AF37]"
              style={{ color: "#8A8A9A" }}
            >
              <ChevronLeft className="w-4 h-4" />
              <Crown className="w-5 h-5" style={{ color: "#D4AF37" }} />
            </Link>
            <div className="h-6 w-px" style={{ backgroundColor: "#2A2A3E" }} />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: "#4B0082" }} />
              <h1
                className="text-sm tracking-wider"
                style={{ color: "#4B0082", fontFamily: "Cinzel, serif" }}
              >
                THE ORACLE
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h2
            className="text-3xl mb-3"
            style={{ color: "#F5F0E6", fontFamily: "Cinzel, serif" }}
          >
            Speak Your Dream.
            <br />
            <span style={{ color: "#D4AF37" }}>Receive Your Briefing.</span>
          </h2>
          <p className="text-sm max-w-lg mx-auto" style={{ color: "#8A8A9A", fontFamily: "Inter, sans-serif" }}>
            The Oracle reads through the Kingdom Lens. Every symbol carries intelligence.
            Every dream is a dispatch from the spirit realm.
          </p>
        </div>

        <div
          className="p-6 rounded-xl border mb-6"
          style={{ backgroundColor: "#14141E", borderColor: "#2A2A3E" }}
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give this dream a title (optional)..."
            className="w-full mb-4 px-4 py-3 rounded-lg border outline-none transition-colors text-sm"
            style={{ backgroundColor: "#0A0A0F", borderColor: "#2A2A3E", color: "#F5F0E6", fontFamily: "Inter, sans-serif" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#4B0082")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2A2A3E")}
          />

          <div className="relative">
            <textarea
              value={dream}
              onChange={(e) => setDream(e.target.value)}
              placeholder="I was chased by my mother around the house... describe what you saw, heard, and felt."
              rows={8}
              className="w-full px-4 py-3 rounded-lg border outline-none transition-colors resize-none text-sm leading-relaxed"
              style={{ backgroundColor: "#0A0A0F", borderColor: "#2A2A3E", color: "#F5F0E6", fontFamily: "Inter, sans-serif" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#4B0082")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#2A2A3E")}
            />
            <button
              onClick={() => setRecording(!recording)}
              className="absolute bottom-3 right-3 p-2 rounded-lg transition-colors"
              style={{ backgroundColor: recording ? "rgba(139,0,0,0.2)" : "rgba(42,42,62,0.5)", color: recording ? "#8B0000" : "#8A8A9A" }}
              title="Voice capture (UI only — connect Whisper API to enable)"
            >
              {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <div className="mt-4">
            <p className="text-xs mb-2" style={{ color: "#8A8A9A", fontFamily: "Cinzel, serif" }}>
              TAG THE REALM
            </p>
            <div className="flex gap-2 flex-wrap">
              {dreamTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.value);
                return (
                  <button
                    key={tag.value}
                    onClick={() => toggleTag(tag.value)}
                    className="px-3 py-1.5 rounded-md text-xs transition-all border"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      backgroundColor: isSelected ? `${tag.color}15` : "#0A0A0F",
                      borderColor: isSelected ? tag.color : "#2A2A3E",
                      color: isSelected ? tag.color : "#8A8A9A",
                    }}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleInterpret}
            disabled={loading || !dream.trim()}
            className="mt-6 w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: loading ? "#2A2A3E" : "#D4AF37", color: loading ? "#8A8A9A" : "#0A0A0F", fontFamily: "Cinzel, serif" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#4B0082" }} />
                The Oracle is reading your spirit...
              </span>
            ) : (
              "Interpret My Dream"
            )}
          </button>
        </div>

        {result && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 rounded-xl border-l-4" style={{ backgroundColor: "#14141E", borderColor: "#2A2A3E", borderLeftColor: "#4B0082" }}>
              <h3 className="text-sm font-bold mb-4 tracking-wider" style={{ color: "#4B0082", fontFamily: "Cinzel, serif" }}>THE SYMBOLS</h3>
              <div className="space-y-3">
                {result.symbols.map((s, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-sm font-bold shrink-0" style={{ color: "#D4AF37", fontFamily: "Cinzel, serif" }}>{s.symbol}:</span>
                    <span className="text-sm leading-relaxed" style={{ color: "#F5F0E6", fontFamily: "Inter, sans-serif" }}>{s.meaning}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-xl border-l-4" style={{ backgroundColor: "#14141E", borderColor: "#2A2A3E", borderLeftColor: "#4B0082" }}>
              <h3 className="text-sm font-bold mb-3 tracking-wider" style={{ color: "#4B0082", fontFamily: "Cinzel, serif" }}>THE SPIRITUAL MEANING</h3>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#F5F0E6", fontFamily: "Inter, sans-serif" }}>{result.meaning}</p>
            </div>

            <div className="p-6 rounded-xl border-l-4" style={{ backgroundColor: "#14141E", borderColor: "#2A2A3E", borderLeftColor: "#046307" }}>
              <h3 className="text-sm font-bold mb-3 tracking-wider" style={{ color: "#046307", fontFamily: "Cinzel, serif" }}>THE MESSAGE</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#F5F0E6", fontFamily: "Inter, sans-serif" }}>{result.message}</p>
            </div>

            <div className="p-6 rounded-xl border-l-4" style={{ backgroundColor: "#14141E", borderColor: "#2A2A3E", borderLeftColor: "#B87333" }}>
              <h3 className="text-sm font-bold mb-3 tracking-wider" style={{ color: "#B87333", fontFamily: "Cinzel, serif" }}>THE ACTION</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#F5F0E6", fontFamily: "Inter, sans-serif" }}>{result.action}</p>
            </div>

            <div className="p-6 rounded-xl border" style={{ background: "linear-gradient(135deg, rgba(75,0,130,0.15) 0%, rgba(212,175,55,0.15) 100%)", borderColor: "#D4AF37" }}>
              <h3 className="text-sm font-bold mb-3 tracking-wider" style={{ color: "#D4AF37", fontFamily: "Cinzel, serif" }}>THE DECREE</h3>
              <p className="text-lg leading-relaxed italic" style={{ color: "#F5F0E6", fontFamily: "Inter, sans-serif" }}>"{result.decree}"</p>
              <button
                onClick={handleSpeakDecree}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-xs border transition-colors hover:bg-[#D4AF37] hover:text-[#0A0A0F]"
                style={{ borderColor: "#D4AF37", color: "#D4AF37", fontFamily: "Cinzel, serif" }}
              >
                <Volume2 className="w-3.5 h-3.5" /> Speak Aloud
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveToVault}
                className="flex-1 py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: saved ? "#046307" : "#04630720", color: saved ? "#F5F0E6" : "#046307", border: "1px solid #046307", fontFamily: "Cinzel, serif" }}
              >
                <Save className="w-4 h-4" />
                {saved ? "Saved to Vault" : "Save to Dream Vault"}
              </button>
              <button
                className="flex-1 py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                style={{ backgroundColor: "#D4AF3720", color: "#D4AF37", border: "1px solid #D4AF37", fontFamily: "Cinzel, serif" }}
                title="Coming soon — sends to Nwankwo for personal reading"
              >
                <Send className="w-4 h-4" /> Share with Prophet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}