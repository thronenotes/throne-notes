"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Crown, Plus, Trash2, Loader2, Printer, Save, Sparkles,
  Eye, Pencil, ArrowLeft
} from "lucide-react";

interface PriceItem {
  id: string;
  description: string;
  amount: string;
}

const currencies = [
  { value: "USD", label: "USD ($)" },
  { value: "GHS", label: "GHS (₵)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "NGN", label: "NGN (₦)" },
  { value: "ZAR", label: "ZAR (R)" },
];

const currencySymbols: Record<string, string> = {
  USD: "$", GHS: "₵", EUR: "€", GBP: "£", NGN: "₦", ZAR: "R",
};

const templates = [
  {
    id: "cinematic", name: "Cinematic", desc: "Dark, gold, dramatic",
    bg: "#0A0A0F", paper: "#14141E", accent: "#D4AF37", text: "#F5F0E6", muted: "#8A8A9A", border: "#2A2A3E",
  },
  {
    id: "royal", name: "Royal", desc: "Deep purple, regal",
    bg: "#0D0A14", paper: "#181226", accent: "#9D6CFF", text: "#F5F0E6", muted: "#9A8AAB", border: "#2E2440",
  },
  {
    id: "emerald", name: "Emerald", desc: "Dark green, wealth",
    bg: "#0A0F0C", paper: "#121E16", accent: "#2ECC71", text: "#F0F5F0", muted: "#8AA89A", border: "#223A2C",
  },
  {
    id: "minimal", name: "Minimal", desc: "Clean light, corporate",
    bg: "#F5F5F2", paper: "#FFFFFF", accent: "#1A1A1A", text: "#1A1A1A", muted: "#6A6A6A", border: "#E0E0DA",
  },
];

export default function ProposalStudio() {
  const router = useRouter();
  const { user } = useAuth();

  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [templateId, setTemplateId] = useState("cinematic");

  // Business
  const [businessName, setBusinessName] = useState("");
  const [businessTagline, setBusinessTagline] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");

  // Client
  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  // Project
  const [projectTitle, setProjectTitle] = useState("");
  const [serviceType, setServiceType] = useState("web_development");
  const [projectBrief, setProjectBrief] = useState("");
  const [scopeOfWork, setScopeOfWork] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [timeline, setTimeline] = useState("");

  // Pricing
  const [items, setItems] = useState<PriceItem[]>([
    { id: "1", description: "", amount: "" },
  ]);
  const [currency, setCurrency] = useState("USD");
  const [depositPercent, setDepositPercent] = useState(50);
  const [terms, setTerms] = useState("This proposal is valid for 14 days. Work begins upon receipt of the deposit payment.");

  const t = templates.find((tp) => tp.id === templateId) || templates[0];
  const sym = currencySymbols[currency] || currency + " ";
  const totalFee = items.reduce((s, i) => s + Number(i.amount || 0), 0);
  const depositAmount = (totalFee * depositPercent) / 100;

  const inputBase = "w-full bg-[#14141E] border border-[#2A2A3E] rounded-lg px-4 py-3 text-[#F5F0E6] text-sm outline-none focus:border-[#D4AF37] transition-all placeholder:text-[#5A5A6A]";
  const labelBase = "block text-[11px] uppercase tracking-widest text-[#8A8A9A] mb-2 font-semibold";

  const addItem = () => setItems((p) => [...p, { id: Date.now().toString(), description: "", amount: "" }]);
  const removeItem = (id: string) => { if (items.length > 1) setItems((p) => p.filter((i) => i.id !== id)); };
  const updateItem = (id: string, field: keyof PriceItem, value: string) =>
    setItems((p) => p.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const handlePrint = () => window.print();

  const handleSave = async () => {
    if (!user?.id) { alert("You must be logged in."); return; }
    if (!clientName || !projectTitle || totalFee <= 0) {
      alert("Fill in client name, project title, and at least one priced item.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/proposal-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          clientName, clientEmail, clientCompany,
          projectTitle, serviceType, projectBrief,
          scopeOfWork, deliverables, timeline,
          totalFee: totalFee.toFixed(2),
          depositPercent, currency, templateStyle: templateId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Proposal saved! Find it in your Proposals list.");
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
              PROPOSAL STUDIO
            </h1>
            <p className="text-[10px] text-[#5A5A6A]">Design. Preview. Close the deal.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-[#14141E] border border-[#2A2A3E] text-[#F5F0E6] rounded-lg text-xs font-bold hover:bg-[#1E1E2A] transition-colors">
            <Printer className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Print / PDF</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#0A0A0F] rounded-lg text-xs font-bold hover:bg-[#C4A030] transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "Saving..." : "Save Proposal"}
          </button>
        </div>
      </div>

      {/* Mobile toggle */}
      <div className="no-print lg:hidden flex gap-2 px-6 pt-4">
        <button onClick={() => setMobileView("edit")} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${mobileView === "edit" ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30" : "text-[#8A8A9A] border border-[#2A2A3E]"}`}>
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
        <button onClick={() => setMobileView("preview")} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${mobileView === "preview" ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30" : "text-[#8A8A9A] border border-[#2A2A3E]"}`}>
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* ─── EDITOR ─── */}
        <div className={`no-print lg:w-[480px] lg:flex-shrink-0 lg:h-[calc(100vh-77px)] lg:overflow-y-auto px-6 py-8 space-y-8 lg:border-r lg:border-[#2A2A3E] ${mobileView === "preview" ? "hidden lg:block" : ""}`}>

          {/* Template picker */}
          <div>
            <label className={labelBase}>Template Style</label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((tp) => (
                <button
                  key={tp.id}
                  onClick={() => setTemplateId(tp.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${templateId === tp.id ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-[#2A2A3E] hover:border-[#3A3A4E]"}`}
                >
                  <div className="flex gap-1.5 mb-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: tp.paper, border: `1px solid ${tp.border}` }} />
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: tp.accent }} />
                  </div>
                  <p className="text-xs font-bold text-[#F5F0E6]">{tp.name}</p>
                  <p className="text-[10px] text-[#5A5A6A]">{tp.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Business */}
          <div className="bg-[#14141E] border border-[#2A2A3E] rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-[#D4AF37] flex items-center gap-2" style={{ fontFamily: "Cinzel, serif" }}>
              <Crown className="w-4 h-4" /> Your Business
            </h2>
            <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Business name *" className={inputBase} />
            <input type="text" value={businessTagline} onChange={(e) => setBusinessTagline(e.target.value)} placeholder="Tagline (e.g., Premium Web Experiences)" className={inputBase} />
            <div className="grid grid-cols-2 gap-3">
              <input type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} placeholder="Email" className={inputBase} />
              <input type="tel" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="Phone" className={inputBase} />
            </div>
          </div>

          {/* Client */}
          <div className="bg-[#14141E] border border-[#2A2A3E] rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-[#D4AF37] flex items-center gap-2" style={{ fontFamily: "Cinzel, serif" }}>
              <Sparkles className="w-4 h-4" /> Client
            </h2>
            <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client name *" className={inputBase} />
            <input type="text" value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} placeholder="Client company" className={inputBase} />
            <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Client email" className={inputBase} />
          </div>

          {/* Project */}
          <div className="bg-[#14141E] border border-[#2A2A3E] rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-[#D4AF37]" style={{ fontFamily: "Cinzel, serif" }}>The Project</h2>
            <input type="text" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="Project title *" className={inputBase} />
            <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className={inputBase}>
              <option value="web_development" className="bg-[#0A0A0F]">Web Development</option>
              <option value="mobile_app" className="bg-[#0A0A0F]">Mobile App</option>
              <option value="branding" className="bg-[#0A0A0F]">Branding</option>
              <option value="consulting" className="bg-[#0A0A0F]">Consulting</option>
              <option value="marketing" className="bg-[#0A0A0F]">Marketing</option>
              <option value="other" className="bg-[#0A0A0F]">Other</option>
            </select>
            <textarea value={projectBrief} onChange={(e) => setProjectBrief(e.target.value)} placeholder="Project brief — what does the client need?" rows={3} className={`${inputBase} resize-none`} />
            <textarea value={scopeOfWork} onChange={(e) => setScopeOfWork(e.target.value)} placeholder="Scope of work — what exactly will you do?" rows={3} className={`${inputBase} resize-none`} />
            <textarea value={deliverables} onChange={(e) => setDeliverables(e.target.value)} placeholder="Deliverables — one per line" rows={3} className={`${inputBase} resize-none`} />
            <input type="text" value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="Timeline (e.g., 4 weeks from deposit)" className={inputBase} />
          </div>

          {/* Pricing */}
          <div className="bg-[#14141E] border border-[#2A2A3E] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#D4AF37]" style={{ fontFamily: "Cinzel, serif" }}>Investment</h2>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={`${inputBase} w-auto py-1.5 text-xs`}>
                {currencies.map((c) => (
                  <option key={c.value} value={c.value} className="bg-[#0A0A0F]">{c.label}</option>
                ))}
              </select>
            </div>
            {items.map((item) => (
              <div key={item.id} className="flex gap-2 items-center">
                <input type="text" value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} placeholder="Service / item" className={`${inputBase} flex-1`} />
                <input type="number" min="0" value={item.amount} onChange={(e) => updateItem(item.id, "amount", e.target.value)} placeholder="0.00" className={`${inputBase} w-28`} />
                <button onClick={() => removeItem(item.id)} className="text-[#8B0000] hover:text-[#8B0000]/70 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={addItem} className="flex items-center gap-1.5 px-3 py-2 bg-[#046307]/15 text-[#046307] rounded-lg text-xs font-bold hover:bg-[#046307]/25 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
            <div>
              <label className={labelBase}>Deposit Required ({depositPercent}%)</label>
              <input type="range" min="0" max="100" step="5" value={depositPercent} onChange={(e) => setDepositPercent(Number(e.target.value))} className="w-full accent-[#D4AF37]" />
            </div>
            <textarea value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="Terms" rows={2} className={`${inputBase} resize-none`} />
          </div>
        </div>

        {/* ─── LIVE PREVIEW ─── */}
        <div className={`studio-preview flex-1 lg:h-[calc(100vh-77px)] lg:overflow-y-auto px-6 py-8 ${mobileView === "edit" ? "hidden lg:block" : ""}`} style={{ backgroundColor: t.bg }}>
          <div className="preview-paper max-w-3xl mx-auto rounded-2xl p-8 md:p-14 shadow-2xl" style={{ backgroundColor: t.paper, color: t.text, border: `1px solid ${t.border}` }}>

            {/* Header */}
            <div className="pb-8 mb-8" style={{ borderBottom: `2px solid ${t.accent}` }}>
              <p className="text-[10px] uppercase tracking-[0.4em] mb-3" style={{ color: t.accent, fontFamily: "Cinzel, serif" }}>
                Proposal
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "Cinzel, serif", color: t.accent }}>
                {businessName || "Your Business"}
              </h1>
              {businessTagline && <p className="text-sm italic" style={{ color: t.muted }}>{businessTagline}</p>}
              <p className="text-xs mt-3" style={{ color: t.muted }}>
                {[businessEmail, businessPhone].filter(Boolean).join("  •  ")}
              </p>
            </div>

            {/* Prepared for */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div>
                <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: t.muted }}>Prepared For</p>
                <p className="text-lg font-bold">{clientName || "Client Name"}</p>
                {clientCompany && <p className="text-sm" style={{ color: t.muted }}>{clientCompany}</p>}
                {clientEmail && <p className="text-sm" style={{ color: t.muted }}>{clientEmail}</p>}
              </div>
              <div className="md:text-right">
                <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: t.muted }}>Date</p>
                <p className="text-sm font-semibold">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
            </div>

            {/* Project */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "Cinzel, serif" }}>
                {projectTitle || "Project Title"}
              </h2>
              {projectBrief && <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: t.muted }}>{projectBrief}</p>}
            </div>

            {scopeOfWork && (
              <div className="mb-10">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: t.accent, fontFamily: "Cinzel, serif" }}>Scope of Work</h3>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: t.muted }}>{scopeOfWork}</p>
              </div>
            )}

            {deliverables && (
              <div className="mb-10">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: t.accent, fontFamily: "Cinzel, serif" }}>Deliverables</h3>
                <ul className="space-y-2">
                  {deliverables.split("\n").filter(Boolean).map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: t.muted }}>
                      <span style={{ color: t.accent }}>◆</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {timeline && (
              <div className="mb-10">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: t.accent, fontFamily: "Cinzel, serif" }}>Timeline</h3>
                <p className="text-sm" style={{ color: t.muted }}>{timeline}</p>
              </div>
            )}

            {/* Investment */}
            <div className="mb-10">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: t.accent, fontFamily: "Cinzel, serif" }}>Investment</h3>
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${t.border}` }}>
                {items.filter((i) => i.description).map((item) => (
                  <div key={item.id} className="flex justify-between px-5 py-3 text-sm" style={{ borderBottom: `1px solid ${t.border}` }}>
                    <span>{item.description}</span>
                    <span className="font-bold">{sym}{Number(item.amount || 0).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between px-5 py-4" style={{ backgroundColor: `${t.accent}15` }}>
                  <span className="font-bold uppercase tracking-wider text-xs" style={{ color: t.muted }}>Total Investment</span>
                  <span className="text-xl font-bold" style={{ color: t.accent, fontFamily: "Cinzel, serif" }}>
                    {sym}{totalFee.toLocaleString()}
                  </span>
                </div>
                {depositPercent > 0 && (
                  <div className="flex justify-between px-5 py-3 text-sm" style={{ borderTop: `1px solid ${t.border}` }}>
                    <span style={{ color: t.muted }}>Deposit to begin ({depositPercent}%)</span>
                    <span className="font-bold">{sym}{depositAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {terms && (
              <div className="mb-10">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: t.accent, fontFamily: "Cinzel, serif" }}>Terms</h3>
                <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: t.muted }}>{terms}</p>
              </div>
            )}

            {/* Signature block */}
            <div className="grid grid-cols-2 gap-8 pt-8" style={{ borderTop: `1px solid ${t.border}` }}>
              <div>
                <div className="h-10 mb-2" style={{ borderBottom: `1px solid ${t.muted}` }} />
                <p className="text-[10px] uppercase tracking-widest" style={{ color: t.muted }}>Client Signature</p>
              </div>
              <div>
                <div className="h-10 mb-2" style={{ borderBottom: `1px solid ${t.muted}` }} />
                <p className="text-[10px] uppercase tracking-widest" style={{ color: t.muted }}>Date</p>
              </div>
            </div>

            <div className="text-center pt-10">
              <p className="text-[10px]" style={{ color: t.muted, opacity: 0.5 }}>Forged in the Proposal Studio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}