"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Crown, Sparkles, ArrowRight, ArrowLeft, FileText, Loader2,
  CheckCircle, DollarSign, Clock, Send, Wand2, Palette
} from "lucide-react";

export default function ProposalBuilder() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientCompany: "",
    projectTitle: "",
    serviceType: "",
    projectBrief: "",
    scopeOfWork: "",
    deliverables: "",
    timeline: "",
    totalFee: "",
    depositPercent: 50,
    currency: "USD",
    templateStyle: "cinematic",
  });

  const services = [
    "Web Development",
    "Mobile App Development",
    "UI/UX Design",
    "Brand Identity",
    "Digital Marketing",
    "Consulting",
    "Custom Software",
    "Other",
  ];

  const update = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const generateWithAI = async () => {
    if (!form.projectBrief || !form.serviceType) {
      alert("Fill in Project Brief and Service Type first.");
      return;
    }
    setAiLoading(true);
    try {
      // Simulated AI generation — replace with real OpenAI call
      await new Promise((r) => setTimeout(r, 1500));

      const service = form.serviceType;
      const brief = form.projectBrief;

      setForm((prev) => ({
        ...prev,
        scopeOfWork: `Based on your request for ${service.toLowerCase()}, we will conduct a comprehensive discovery phase, followed by design iterations, development sprints, and thorough QA testing before deployment.

${brief}`,
        deliverables: `• Complete ${service} solution
• Source code and documentation
• 30-day post-launch support
• Training session for your team`,
        timeline: "4–6 weeks from deposit confirmation",
      }));
    } catch (e) {
      alert("AI generation failed. Write manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          totalFee: parseFloat(form.totalFee) || 0,
          aiGenerated: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/dashboard/proposals?created=${data.contract.id}`);
      } else {
        alert(data.error || "Failed to create proposal");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setCreating(false);
    }
  };

  const inputBase = "w-full bg-[#14141E] border border-[#2A2A3E] rounded-lg px-4 py-3 text-[#F5F0E6] text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all placeholder:text-[#5A5A6A]";
  const labelBase = "block text-[11px] uppercase tracking-widest text-[#8A8A9A] mb-2 font-semibold";

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F0E6] font-[Inter,sans-serif]">
      {/* Header */}
      <div className="border-b border-[#2A2A3E] px-6 py-5 flex items-center justify-between sticky top-0 bg-[#0A0A0F]/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-[#D4AF37]" />
          <div>
            <h1 className="text-sm font-bold tracking-wider text-[#D4AF37]" style={{ fontFamily: "Cinzel, serif" }}>
              PROPOSAL FORGE
            </h1>
            <p className="text-[10px] text-[#5A5A6A]">Create cinematic proposals that close deals</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`w-8 h-1 rounded-full transition-all ${step >= s ? "bg-[#D4AF37]" : "bg-[#2A2A3E]"}`} />
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* STEP 1: Client */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-[#F5F0E6] mb-2" style={{ fontFamily: "Cinzel, serif" }}>
              Who is this for?
            </h2>
            <p className="text-sm text-[#8A8A9A] mb-8">The client receiving this proposal.</p>

            <div className="space-y-5">
              <div>
                <label className={labelBase}>Client Name *</label>
                <input type="text" value={form.clientName} onChange={(e) => update("clientName", e.target.value)} placeholder="John Mensah" className={inputBase} />
              </div>
              <div>
                <label className={labelBase}>Email Address *</label>
                <input type="email" value={form.clientEmail} onChange={(e) => update("clientEmail", e.target.value)} placeholder="john@company.com" className={inputBase} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelBase}>Phone</label>
                  <input type="tel" value={form.clientPhone} onChange={(e) => update("clientPhone", e.target.value)} placeholder="+233 20 000 0000" className={inputBase} />
                </div>
                <div>
                  <label className={labelBase}>Company</label>
                  <input type="text" value={form.clientCompany} onChange={(e) => update("clientCompany", e.target.value)} placeholder="Company Ltd" className={inputBase} />
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!form.clientName || !form.clientEmail}
              className="mt-8 w-full py-3.5 bg-[#D4AF37] text-[#0A0A0F] font-bold text-sm rounded-lg hover:bg-[#C4A030] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Project */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-[#F5F0E6] mb-2" style={{ fontFamily: "Cinzel, serif" }}>
              What are you building?
            </h2>
            <p className="text-sm text-[#8A8A9A] mb-8">Define the project scope and vision.</p>

            <div className="space-y-5">
              <div>
                <label className={labelBase}>Project Title *</label>
                <input type="text" value={form.projectTitle} onChange={(e) => update("projectTitle", e.target.value)} placeholder="e.g., E-Commerce Platform Redesign" className={inputBase} />
              </div>
              <div>
                <label className={labelBase}>Service Type *</label>
                <select value={form.serviceType} onChange={(e) => update("serviceType", e.target.value)} className={inputBase}>
                  <option value="" className="bg-[#0A0A0F]">Select service...</option>
                  {services.map((s) => (
                    <option key={s} value={s} className="bg-[#0A0A0F]">{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelBase}>Project Brief *</label>
                <textarea value={form.projectBrief} onChange={(e) => update("projectBrief", e.target.value)} placeholder="Describe what the client needs..." rows={4} className={`${inputBase} resize-y`} />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)} className="flex-1 py-3.5 border border-[#2A2A3E] text-[#8A8A9A] rounded-lg text-sm font-semibold hover:bg-[#1E1E2A] transition-colors">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!form.projectTitle || !form.serviceType || !form.projectBrief}
                className="flex-1 py-3.5 bg-[#D4AF37] text-[#0A0A0F] font-bold text-sm rounded-lg hover:bg-[#C4A030] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Scope & AI */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-[#F5F0E6]" style={{ fontFamily: "Cinzel, serif" }}>
                Scope of Work
              </h2>
              <button
                onClick={generateWithAI}
                disabled={aiLoading}
                className="flex items-center gap-2 px-4 py-2 bg-[#4B0082]/20 border border-[#4B0082]/40 text-[#4B0082] rounded-lg text-xs font-bold hover:bg-[#4B0082]/30 transition-colors"
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                {aiLoading ? "Generating..." : "AI Generate"}
              </button>
            </div>
            <p className="text-sm text-[#8A8A9A] mb-8">Define deliverables, timeline, and scope.</p>

            <div className="space-y-5">
              <div>
                <label className={labelBase}>Scope of Work</label>
                <textarea value={form.scopeOfWork} onChange={(e) => update("scopeOfWork", e.target.value)} placeholder="Detailed breakdown of what will be done..." rows={5} className={`${inputBase} resize-y`} />
              </div>
              <div>
                <label className={labelBase}>Deliverables</label>
                <textarea value={form.deliverables} onChange={(e) => update("deliverables", e.target.value)} placeholder="List all items the client will receive..." rows={4} className={`${inputBase} resize-y`} />
              </div>
              <div>
                <label className={labelBase}>Timeline</label>
                <input type="text" value={form.timeline} onChange={(e) => update("timeline", e.target.value)} placeholder="e.g., 4–6 weeks" className={inputBase} />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(2)} className="flex-1 py-3.5 border border-[#2A2A3E] text-[#8A8A9A] rounded-lg text-sm font-semibold hover:bg-[#1E1E2A] transition-colors">
                Back
              </button>
              <button onClick={() => setStep(4)} className="flex-1 py-3.5 bg-[#D4AF37] text-[#0A0A0F] font-bold text-sm rounded-lg hover:bg-[#C4A030] transition-colors flex items-center justify-center gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Pricing & Style */}
        {step === 4 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-[#F5F0E6] mb-2" style={{ fontFamily: "Cinzel, serif" }}>
              Price & Presentation
            </h2>
            <p className="text-sm text-[#8A8A9A] mb-8">Set your fee and choose the visual style.</p>

            <div className="space-y-6">
              {/* Template Style */}
              <div>
                <label className={labelBase}>Proposal Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "cinematic", name: "Cinematic", desc: "Dark, gold, dramatic" },
                    { key: "minimal", name: "Minimal", desc: "Clean, white, modern" },
                    { key: "royal", name: "Royal", desc: "Purple, ornate, premium" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => update("templateStyle", t.key)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        form.templateStyle === t.key
                          ? "border-[#D4AF37] bg-[#D4AF37]/10"
                          : "border-[#2A2A3E] bg-[#14141E] hover:border-[#3A3A4E]"
                      }`}
                    >
                      <Palette className={`w-5 h-5 mb-2 ${form.templateStyle === t.key ? "text-[#D4AF37]" : "text-[#8A8A9A]"}`} />
                      <p className={`text-sm font-bold ${form.templateStyle === t.key ? "text-[#D4AF37]" : "text-[#F5F0E6]"}`}>{t.name}</p>
                      <p className="text-[10px] text-[#8A8A9A] mt-1">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelBase}>Total Fee *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
                    <input type="number" min="0" value={form.totalFee} onChange={(e) => update("totalFee", e.target.value)} placeholder="5000" className={`${inputBase} pl-10`} />
                  </div>
                </div>
                <div>
                  <label className={labelBase}>Deposit %</label>
                  <select value={form.depositPercent} onChange={(e) => update("depositPercent", parseInt(e.target.value))} className={inputBase}>
                    <option value={25} className="bg-[#0A0A0F]">25%</option>
                    <option value={50} className="bg-[#0A0A0F]">50%</option>
                    <option value={75} className="bg-[#0A0A0F]">75%</option>
                    <option value={100} className="bg-[#0A0A0F]">100%</option>
                  </select>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-[#14141E] border border-[#2A2A3E] rounded-xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[#8A8A9A] text-sm">Total Project Value</span>
                  <span className="text-[#D4AF37] text-xl font-bold">${Number(form.totalFee || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[#8A8A9A] text-sm">Deposit Required ({form.depositPercent}%)</span>
                  <span className="text-[#046307] font-bold">${(Number(form.totalFee || 0) * (form.depositPercent / 100)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8A8A9A] text-sm">Balance on Delivery</span>
                  <span className="text-[#F5F0E6] font-bold">${(Number(form.totalFee || 0) * (1 - form.depositPercent / 100)).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(3)} className="flex-1 py-3.5 border border-[#2A2A3E] text-[#8A8A9A] rounded-lg text-sm font-semibold hover:bg-[#1E1E2A] transition-colors">
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !form.totalFee}
                className="flex-1 py-3.5 bg-[#D4AF37] text-[#0A0A0F] font-bold text-sm rounded-lg hover:bg-[#C4A030] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Sparkles className="w-4 h-4" /> Forge Proposal</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}