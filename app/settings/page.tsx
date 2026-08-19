"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Crown, ChevronLeft, Loader2, Save, User, Calendar, FileText, Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [birthDate, setBirthDate] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/login";
      return;
    }
    if (user) fetchProfile();
  }, [user, authLoading]);

  const fetchProfile = async () => {
    const res = await fetch(`/api/profile?userId=${user?.id}`);
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
      setFullName(data.fullName || "");
      setDisplayName(data.displayName || "");
      setBio(data.bio || "");
      setBirthDate(data.birthDate || "");
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          fullName: fullName || null,
          displayName: displayName || null,
          bio: bio || null,
          birthDate: birthDate || null,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A0A0F" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#D4AF37" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0A0F" }}>
      <header className="border-b sticky top-0 z-40" style={{ backgroundColor: "rgba(20,20,30,0.8)", borderColor: "#2A2A3E", backdropFilter: "blur(8px)" }}>
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 transition-colors hover:text-[#D4AF37]" style={{ color: "#8A8A9A" }}>
            <ChevronLeft className="w-4 h-4" />
            <Crown className="w-5 h-5" style={{ color: "#D4AF37" }} />
          </Link>
          <div className="h-6 w-px" style={{ backgroundColor: "#2A2A3E" }} />
          <h1 className="text-sm tracking-wider" style={{ color: "#F5F0E6", fontFamily: "Cinzel, serif" }}>SETTINGS</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#8A8A9A", fontFamily: "Cinzel, serif" }}>
            Your Identity
          </p>
          <h1 className="text-3xl" style={{ color: "#F5F0E6", fontFamily: "Cinzel, serif" }}>
            Profile & <span style={{ color: "#D4AF37" }}>Blueprint</span>
          </h1>
        </div>

        <div className="space-y-8">
          {/* Identity */}
          <div className="p-6 rounded-xl border" style={{ backgroundColor: "rgba(20,20,30,0.4)", borderColor: "#2A2A3E" }}>
            <h2 className="text-sm font-medium mb-5 flex items-center gap-2" style={{ color: "#F5F0E6", fontFamily: "Cinzel, serif" }}>
              <User className="w-4 h-4" style={{ color: "#D4AF37" }} /> Identity
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider mb-2 block" style={{ color: "#8A8A9A" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border outline-none text-sm transition-colors"
                  style={{ backgroundColor: "#0A0A0F", borderColor: "#2A2A3E", color: "#F5F0E6" }}
                  placeholder="Nwankwo Moses Ezechukwu"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider mb-2 block" style={{ color: "#8A8A9A" }}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border outline-none text-sm transition-colors"
                  style={{ backgroundColor: "#0A0A0F", borderColor: "#2A2A3E", color: "#F5F0E6" }}
                  placeholder="How fans see you"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider mb-2 block" style={{ color: "#8A8A9A" }}>
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border outline-none text-sm transition-colors resize-none"
                  style={{ backgroundColor: "#0A0A0F", borderColor: "#2A2A3E", color: "#F5F0E6" }}
                  placeholder="Who you are in the Kingdom..."
                />
              </div>
            </div>
          </div>

          {/* Birth Blueprint */}
          <div className="p-6 rounded-xl border" style={{ backgroundColor: "rgba(20,20,30,0.4)", borderColor: "#2A2A3E" }}>
            <h2 className="text-sm font-medium mb-5 flex items-center gap-2" style={{ color: "#F5F0E6", fontFamily: "Cinzel, serif" }}>
              <Calendar className="w-4 h-4" style={{ color: "#D4AF37" }} /> Birth Blueprint
            </h2>
            <div>
              <label className="text-[11px] uppercase tracking-wider mb-2 block" style={{ color: "#8A8A9A" }}>
                Birth Date
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border outline-none text-sm transition-colors"
                style={{ backgroundColor: "#0A0A0F", borderColor: "#2A2A3E", color: "#F5F0E6" }}
              />
              <p className="text-[11px] mt-2" style={{ color: "#8A8A9A" }}>
                Saved to your profile so numerology calculates automatically.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-40 flex items-center gap-2"
              style={{ backgroundColor: "#D4AF37", color: "#0A0A0F" }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
            </button>
            <Link href="/dashboard" className="text-xs hover:text-[#D4AF37] transition-colors" style={{ color: "#8A8A9A" }}>
              Back to Throne Room
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}