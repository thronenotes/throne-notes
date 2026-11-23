"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Crown, ArrowLeft, Loader2, Sparkles, Printer, Save,
  RefreshCw, Send, ImageIcon, X
} from "lucide-react";

interface DocSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  imageIndex?: number | null;
}

interface GeneratedDoc {
  title: string;
  subtitle: string;
  executiveSummary: string;
  sections: DocSection[];
  pricing?: { item: string; amount: string }[];
  callToAction?: string;
}

const formats = [
  { id: "proposal", name: "Proposal", desc: "Win the client" },
  { id: "pitch", name: "Pitch Deck", desc: "Sell the idea" },
  { id: "report", name: "Report", desc: "Inform & impress" },
  { id: "onepager", name: "One-Pager", desc: "Short & sharp" },
];

const templates = [
  { id: "cinematic", name: "Cinematic", bg: "#0A0A0F", paper: "#14141E", accent: "#D4AF37", text: "#F5F0E6", muted: "#8A8A9A", border: "#2A2A3E" },
  { id: "royal", name: "Royal", bg: "#0D0A14", paper: "#181226", accent: "#9D6CFF", text: "#F5F0E6", muted: "#9A8AAB", border: "#2E2440" },
  { id: "emerald", name: "Emerald", bg: "#0A0F0C", paper: "#121E16", accent: "#2ECC71", text: "#F0F5F0", muted: "#8AA89A", border: "#223A2C" },
  { id: "minimal", name: "Minimal", bg: "#F5F5F2", paper: "#FFFFFF", accent: "#1A1A1A", text: "#1A1A1A", muted: "#6A6A6A", border: "#E0E0DA" },
];

const MAX_IMAGES = 4;

export default function DesignStudio() {
  const router = useRouter();
  const { user } = useAuth();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [prompt, setPrompt] = useState("");
  const [format, setFormat] = useState("proposal");
  const [templateId, setTemplateId] = useState("cinematic");
  const [images, setImages] = useState<string[]>([]);
  const [doc, setDoc] = useState<GeneratedDoc | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const t = templates.find((tp) => tp.id === templateId) || templates[0];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const remaining = MAX_IMAGES - images.length;
    files.slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => {
          if (prev.length >= MAX_IMAGES) return prev;
          return [...prev, reader.result as string];
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/design-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, format, images }),
      });
      const data = await res.json();
      if (data.success) {
        setDoc(data.doc);
      } else {
        alert(data.error || "Generation failed");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id || !doc) return;
    setSaving(true);
    try {
      const res = await fetch("/api/design-studio/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, doc, format, templateStyle: templateId }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Saved! Find it in your Proposals list.");
        router.push("/dashboard/proposals");
      } else {
        alert(data.error || "Failed to save");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => window.print();

  const totalAmount = (doc?.pricing || []).reduce((s, p) => s + Number(p.amount || 0), 0);

  const imagePicker = (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A] mb-2 font-semibold">
        Attach Images (optional, max {MAX_IMAGES})
      </p>
      <div className="flex flex-wrap gap-2">
        {images.map((img, i) => (
          <div key={i} className="relative group">
            <img src={img} alt="" className="h-16 w-16 rounded-lg object-cover border border-[#2A2A3E]" />
            <button
              onClick={() => removeImage(i)}
              className="absolute -top-1.5 -right-1.5 bg-[#8B0000] text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <button
            onClick={() => imageInputRef.current?.click()}
            className="h-16 w-16 rounded-lg border-2 border-dashed border-[#2A2A3E] flex flex-col items-center justify-center text-[#5A5A6A] hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="text-[8px] mt-1">Add</span>
          </button>
        )}
      </div>
      <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
      {images.length > 0 && (
        <p className="text-[10px] text-[#5A5A6A] mt-2">The AI will see these and weave them into the design.</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F0E6] font-[Inter,sans-serif]">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .studio-preview { display: block !important; width: 100% !important; }
          .preview-paper { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; }
        }
      `}</style>

      {/* Header */}
      <div className="no-print border-b border-[#2A2A3E] px-6 py-5 flex items-center justify-between sticky top-0 bg-[#0A0A0F]/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-[#8A8A9A] hover:text-[#D4AF37] transition-colors p-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Crown className="w-6 h-6 text-[#D4AF37]" />
          <div>
            <h1 className="text-sm font-bold tracking-wider text-[#D4AF37]" style={{ fontFamily: "Cinzel, serif" }}>
              DESIGN STUDIO
            </h1>
            <p className="text-[10px] text-[#5A5A6A]">Describe it. We design it.</p>
          </div>
        </div>
        {doc && (
          <div className="flex items-center gap-2">
            <button onClick={() => setDoc(null)} className="flex items-center gap-2 px-4 py-2 bg-[#14141E] border border-[#2A2A3E] text-[#8A8A9A] rounded-lg text-xs font-bold hover:bg-[#1E1E2A] transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> New
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-[#14141E] border border-[#2A2A3E] text-[#F5F0E6] rounded-lg text-xs font-bold hover:bg-[#1E1E2A] transition-colors">
              <Printer className="w-3.5 h-3.5" /> Print / PDF
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#0A0A0F] rounded-lg text-xs font-bold hover:bg-[#C4A030] transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save
            </button>
          </div>
        )}
      </div>

      {!doc ? (
        /* ─── HERO: GAMMA-STYLE PROMPT ─── */
        <div className="max-w-3xl mx-auto px-6 pt-20 pb-16">
          <div className="text-center mb-10">
            <Sparkles className="w-10 h-10 text-[#D4AF37] mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: "Cinzel, serif" }}>
              What do you want to <span className="text-[#D4AF37]">create</span>?
            </h2>
            <p className="text-sm text-[#8A8A9A]">
              One prompt. Optional images. A fully designed document.
            </p>
          </div>

          <div className="bg-[#14141E] border border-[#2A2A3E] rounded-2xl p-6 space-y-5">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g., "A proposal for a fashion brand website redesign, 3-week timeline, $2,500 budget, targeting a client named Adaeze" — or just "pitch deck for a food delivery app in Lagos"'
              rows={4}
              className="w-full bg-[#0A0A0F] border border-[#2A2A3E] rounded-xl px-5 py-4 text-[#F5F0E6] text-sm outline-none focus:border-[#D4AF37] transition-all placeholder:text-[#5A5A6A] resize-none"
            />

            {imagePicker}

            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A] mb-2 font-semibold">Format</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {formats.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${format === f.id ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-[#2A2A3E] hover:border-[#3A3A4E]"}`}
                  >
                    <p className="text-xs font-bold">{f.name}</p>
                    <p className="text-[10px] text-[#5A5A6A]">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A] mb-2 font-semibold">Style</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {templates.map((tp) => (
                  <button
                    key={tp.id}
                    onClick={() => setTemplateId(tp.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${templateId === tp.id ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-[#2A2A3E] hover:border-[#3A3A4E]"}`}
                  >
                    <div className="flex gap-1.5 mb-1.5">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: tp.paper, border: `1px solid ${tp.border}` }} />
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: tp.accent }} />
                    </div>
                    <p className="text-xs font-bold">{tp.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="w-full py-4 bg-[#D4AF37] text-[#0A0A0F] font-bold text-sm rounded-xl hover:bg-[#C4A030] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Designing your document...</>
              ) : (
                <><Send className="w-4 h-4" /> Generate</>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* ─── RESULT: CONTROLS + PREVIEW ─── */
        <div className="flex flex-col lg:flex-row">
          <div className="no-print lg:w-[380px] lg:flex-shrink-0 lg:h-[calc(100vh-77px)] lg:overflow-y-auto px-6 py-8 space-y-6 lg:border-r lg:border-[#2A2A3E]">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A] mb-2 font-semibold">Your Prompt</p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-xl px-4 py-3 text-[#F5F0E6] text-sm outline-none focus:border-[#D4AF37] transition-all resize-none"
              />
            </div>

            {imagePicker}

            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A] mb-2 font-semibold">Style</p>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((tp) => (
                  <button
                    key={tp.id}
                    onClick={() => setTemplateId(tp.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${templateId === tp.id ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-[#2A2A3E] hover:border-[#3A3A4E]"}`}
                  >
                    <div className="flex gap-1.5 mb-1">
                      <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: tp.paper, border: `1px solid ${tp.border}` }} />
                      <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: tp.accent }} />
                    </div>
                    <p className="text-[11px] font-bold">{tp.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-3.5 bg-[#D4AF37] text-[#0A0A0F] font-bold text-sm rounded-xl hover:bg-[#C4A030] transition-colors disabled:opacity-30 flex items-center justify-center gap-2"
            >
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Regenerating...</> : <><RefreshCw className="w-4 h-4" /> Regenerate</>}
            </button>
            <p className="text-[10px] text-[#5A5A6A] text-center">Tweak the prompt or swap images, then regenerate.</p>
          </div>

          {/* Preview */}
          <div className="studio-preview flex-1 lg:h-[calc(100vh-77px)] lg:overflow-y-auto px-6 py-8" style={{ backgroundColor: t.bg }}>
            <div className="preview-paper max-w-3xl mx-auto rounded-2xl p-8 md:p-14 shadow-2xl" style={{ backgroundColor: t.paper, color: t.text, border: `1px solid ${t.border}` }}>

              <div className="pb-8 mb-8" style={{ borderBottom: `2px solid ${t.accent}` }}>
                <p className="text-[10px] uppercase tracking-[0.4em] mb-3" style={{ color: t.accent, fontFamily: "Cinzel, serif" }}>
                  {formats.find((f) => f.id === format)?.name || "Document"}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "Cinzel, serif", color: t.accent }}>
                  {doc.title}
                </h1>
                {doc.subtitle && <p className="text-sm italic" style={{ color: t.muted }}>{doc.subtitle}</p>}
              </div>

              {/* Hero image: first attached image shows at the top if the AI didn't place it in a section */}
              {images[0] && !doc.sections?.some((s) => s.imageIndex === 0) && (
                <div className="mb-10">
                  <img src={images[0]} alt="" className="w-full rounded-xl object-cover max-h-72" style={{ border: `1px solid ${t.border}` }} />
                </div>
              )}

              {doc.executiveSummary && (
                <div className="mb-10">
                  <p className="text-base leading-relaxed" style={{ color: t.text }}>{doc.executiveSummary}</p>
                </div>
              )}

              {(doc.sections || []).map((section, i) => (
                <div key={i} className="mb-10">
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: t.accent, fontFamily: "Cinzel, serif" }}>
                    {section.heading}
                  </h3>
                  {typeof section.imageIndex === "number" && images[section.imageIndex] && (
                    <img src={images[section.imageIndex]} alt="" className="w-full rounded-xl object-cover max-h-64 mb-4" style={{ border: `1px solid ${t.border}` }} />
                  )}
                  {(section.paragraphs || []).map((p, j) => (
                    <p key={j} className="text-sm leading-relaxed mb-3 whitespace-pre-line" style={{ color: t.muted }}>{p}</p>
                  ))}
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="space-y-2">
                      {section.bullets.map((b, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm" style={{ color: t.muted }}>
                          <span style={{ color: t.accent }}>◆</span> {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {doc.pricing && doc.pricing.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: t.accent, fontFamily: "Cinzel, serif" }}>Investment</h3>
                  <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${t.border}` }}>
                    {doc.pricing.map((p, i) => (
                      <div key={i} className="flex justify-between px-5 py-3 text-sm" style={{ borderBottom: `1px solid ${t.border}` }}>
                        <span>{p.item}</span>
                        <span className="font-bold">{Number(p.amount).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between px-5 py-4" style={{ backgroundColor: `${t.accent}15` }}>
                      <span className="font-bold uppercase tracking-wider text-xs" style={{ color: t.muted }}>Total</span>
                      <span className="text-xl font-bold" style={{ color: t.accent, fontFamily: "Cinzel, serif" }}>
                        {totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {doc.callToAction && (
                <div className="rounded-xl p-6 text-center" style={{ backgroundColor: `${t.accent}10`, border: `1px solid ${t.accent}30` }}>
                  <p className="text-sm font-semibold" style={{ color: t.accent }}>{doc.callToAction}</p>
                </div>
              )}

              <div className="text-center pt-10">
                <p className="text-[10px]" style={{ color: t.muted, opacity: 0.5 }}>Forged in the Design Studio</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}