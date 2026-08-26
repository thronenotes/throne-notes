"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Crown, CheckCircle, Loader2, AlertCircle, FileText, Shield,
  Clock, DollarSign, Send, Sparkles, ChevronDown, Printer
} from "lucide-react";
import SignatureCanvas from "@/components/SignatureCanvas";

export default function ProposalView() {
  const params = useParams();
  const proposalId = params.id as string;

  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signed, setSigned] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signatureData, setSignatureData] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    fetchProposal();
  }, [proposalId]);

  const fetchProposal = async () => {
    try {
      const res = await fetch(`/api/proposals/${proposalId}`);
      const data = await res.json();
      if (data.contract) {
        setProposal(data.contract);
        if (data.contract.status === "signed") setSigned(true);
      } else {
        setError("Proposal not found");
      }
    } catch (e) {
      setError("Failed to load proposal");
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!signatureData) return;
    setSigning(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureData }),
      });
      const data = await res.json();
      if (data.success) {
        setSigned(true);
        setProposal(data.contract);
      }
    } catch (e) {
      alert("Failed to sign");
    } finally {
      setSigning(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center text-[#8B0000]">
        <AlertCircle className="w-6 h-6 mr-2" /> {error || "Not found"}
      </div>
    );
  }

  const depositAmount = (Number(proposal.totalFee) * (proposal.depositPercent / 100)).toFixed(2);
  const finalAmount = (Number(proposal.totalFee) - Number(depositAmount)).toFixed(2);
  const scopeLines = proposal.scopeOfWork ? proposal.scopeOfWork.split("\n").filter((l: string) => l.trim()) : [];
  const deliverableLines = proposal.deliverables ? proposal.deliverables.split("\n").filter((l: string) => l.trim()) : [];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F0E6] font-[Inter,sans-serif]">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .proposal-paper { background: #fff !important; color: #000 !important; padding: 48px !important; }
          .proposal-paper * { color: #000 !important; }
          .proposal-paper .gold-text { color: #8B6914 !important; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeInUp 0.8s ease forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.2s; opacity: 0; }
        .delay-3 { animation-delay: 0.3s; opacity: 0; }
        .glass-card {
          background: rgba(20, 20, 30, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.1);
        }
      `}</style>

      {/* HERO */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F] via-[#14141E] to-[#0A0A0F]" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(212,175,55,0.15) 0%, transparent 60%)`
        }} />

        <div className="relative z-10 max-w-3xl animate-fade-up">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Crown className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#8A8A9A]">Crown Benz Proposal</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight" style={{ fontFamily: "Cinzel, serif", color: "#F5F0E6" }}>
            {proposal.projectTitle}
          </h1>

          <p className="text-lg text-[#8A8A9A] mb-8">
            Prepared exclusively for <span className="text-[#D4AF37] font-semibold">{proposal.clientName}</span>
            {proposal.clientCompany && ` at ${proposal.clientCompany}`}
          </p>

          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-[#8A8A9A]">
              <FileText className="w-4 h-4 text-[#D4AF37]" />
              <span>{proposal.contractNumber}</span>
            </div>
            <div className="w-px h-4 bg-[#2A2A3E]" />
            <div className="flex items-center gap-2 text-[#8A8A9A]">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span>{proposal.timeline || "Timeline TBD"}</span>
            </div>
            <div className="w-px h-4 bg-[#2A2A3E]" />
            <div className="flex items-center gap-2 text-[#8A8A9A]">
              <DollarSign className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-bold">${Number(proposal.totalFee).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 no-print">
          <ChevronDown className="w-6 h-6 text-[#8A8A9A] animate-bounce" />
        </div>
      </section>

      {/* NAV PILLS */}
      <div className="no-print sticky top-0 z-30 bg-[#0A0A0F]/90 backdrop-blur-md border-b border-[#2A2A3E] px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto">
          {[
            { id: "overview", label: "Overview" },
            { id: "scope", label: "Scope" },
            { id: "deliverables", label: "Deliverables" },
            { id: "investment", label: "Investment" },
            { id: "terms", label: "Terms" },
            { id: "signature", label: "Signature" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeSection === item.id
                  ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30"
                  : "text-[#8A8A9A] hover:text-[#F5F0E6] border border-transparent"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="proposal-paper max-w-4xl mx-auto px-6 py-16 space-y-24">

        {/* OVERVIEW */}
        <section id="overview" className="animate-fade-up delay-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "Cinzel, serif", color: "#D4AF37" }}>
              Project Overview
            </h2>
          </div>
          <div className="glass-card rounded-2xl p-8">
            <p className="text-[#B0B0B0] leading-relaxed text-lg">
              {proposal.projectBrief}
            </p>
            <div className="mt-6 pt-6 border-t border-[#2A2A3E] grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A] mb-1">Service</p>
                <p className="text-sm font-semibold text-[#F5F0E6]">{proposal.serviceType}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A] mb-1">Client</p>
                <p className="text-sm font-semibold text-[#F5F0E6]">{proposal.clientName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A] mb-1">Timeline</p>
                <p className="text-sm font-semibold text-[#F5F0E6]">{proposal.timeline || "TBD"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A] mb-1">Contract</p>
                <p className="text-sm font-semibold text-[#D4AF37]">{proposal.contractNumber}</p>
              </div>
            </div>
          </div>
        </section>

        {/* SCOPE */}
        <section id="scope" className="animate-fade-up delay-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#4B0082]/10 border border-[#4B0082]/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#4B0082]" />
            </div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "Cinzel, serif", color: "#D4AF37" }}>
              Scope of Work
            </h2>
          </div>
          <div className="space-y-4">
            {scopeLines.length > 0 ? (
              scopeLines.map((line: string, i: number) => (
                <div key={i} className="glass-card rounded-xl p-6 flex items-start gap-4 hover:border-[#D4AF37]/20 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#D4AF37]">{i + 1}</span>
                  </div>
                  <p className="text-[#B0B0B0] leading-relaxed">{line.replace(/^[-•\s]+/, "")}</p>
                </div>
              ))
            ) : (
              <div className="glass-card rounded-xl p-6 text-[#8A8A9A]">
                Scope of work will be detailed here.
              </div>
            )}
          </div>
        </section>

        {/* DELIVERABLES */}
        <section id="deliverables" className="animate-fade-up delay-3">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#046307]/10 border border-[#046307]/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[#046307]" />
            </div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "Cinzel, serif", color: "#D4AF37" }}>
              Deliverables
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {deliverableLines.length > 0 ? (
              deliverableLines.map((line: string, i: number) => (
                <div key={i} className="glass-card rounded-xl p-5 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#046307]/20 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-[#046307]" />
                  </div>
                  <span className="text-sm text-[#B0B0B0]">{line.replace(/^[-•\s]+/, "")}</span>
                </div>
              ))
            ) : (
              <div className="glass-card rounded-xl p-5 text-[#8A8A9A] md:col-span-2">
                Deliverables will be listed here.
              </div>
            )}
          </div>
        </section>

        {/* INVESTMENT */}
        <section id="investment" className="animate-fade-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "Cinzel, serif", color: "#D4AF37" }}>
              Investment
            </h2>
          </div>

          <div className="glass-card rounded-2xl p-8 border-[#D4AF37]/20">
            <div className="text-center mb-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#8A8A9A] mb-2">Total Project Value</p>
              <p className="text-5xl font-bold text-[#D4AF37]" style={{ fontFamily: "Cinzel, serif" }}>
                ${Number(proposal.totalFee).toLocaleString()}
              </p>
              <p className="text-sm text-[#8A8A9A] mt-2">{proposal.currency}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#046307]/5 border border-[#046307]/20 rounded-xl p-6 text-center">
                <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A] mb-2">Deposit ({proposal.depositPercent}%)</p>
                <p className="text-2xl font-bold text-[#046307]">${Number(depositAmount).toLocaleString()}</p>
                <p className="text-xs text-[#8A8A9A] mt-2">Due before work begins</p>
              </div>
              <div className="bg-[#14141E] border border-[#2A2A3E] rounded-xl p-6 text-center">
                <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A] mb-2">Final Payment</p>
                <p className="text-2xl font-bold text-[#F5F0E6]">${Number(finalAmount).toLocaleString()}</p>
                <p className="text-xs text-[#8A8A9A] mt-2">Due before delivery</p>
              </div>
            </div>
          </div>
        </section>

        {/* TERMS */}
        <section id="terms" className="animate-fade-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#8B0000]/10 border border-[#8B0000]/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#8B0000]" />
            </div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "Cinzel, serif", color: "#D4AF37" }}>
              Terms & Conditions
            </h2>
          </div>
          <div className="glass-card rounded-2xl p-8">
            <ol className="space-y-4 text-sm text-[#B0B0B0] leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="text-[#D4AF37] font-bold shrink-0">01.</span>
                <span>Work begins only after the deposit is received and cleared in full.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#D4AF37] font-bold shrink-0">02.</span>
                <span>No revisions are included after final delivery unless specified in writing and paid separately.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#D4AF37] font-bold shrink-0">03.</span>
                <span>All source code, design files, and deliverables remain the property of <strong className="text-[#F5F0E6]">Nwankwo Moses Ezechukwu (Crown Benz)</strong> until final payment is cleared.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#D4AF37] font-bold shrink-0">04.</span>
                <span>Cancellation by client: deposit is forfeited. Cancellation by provider: deposit returned within 7 business days.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#D4AF37] font-bold shrink-0">05.</span>
                <span>Late payment fee: <strong className="text-[#F5F0E6]">10% per week</strong> after the agreed deadline.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#D4AF37] font-bold shrink-0">06.</span>
                <span>Any disputes shall be resolved in Accra, Ghana under Ghanaian law.</span>
              </li>
            </ol>
            <div className="mt-8 pt-6 border-t border-[#2A2A3E] text-center">
              <p className="text-[#8B0000] font-bold text-sm tracking-wider italic">
                "NO DOCUMENT. NO WORK. NO EXCEPTIONS."
              </p>
            </div>
          </div>
        </section>

        {/* SIGNATURE */}
        <section id="signature" className="animate-fade-up pb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
              <Send className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "Cinzel, serif", color: "#D4AF37" }}>
              {signed ? "Contract Signed" : "Sign & Commit"}
            </h2>
          </div>

          {signed ? (
            <div className="glass-card rounded-2xl p-10 text-center border-[#046307]/30">
              <div className="w-16 h-16 rounded-full bg-[#046307]/10 border-2 border-[#046307] flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#046307]" />
              </div>
              <h3 className="text-xl font-bold text-[#046307] mb-2">Proposal Signed</h3>
              <p className="text-[#8A8A9A] text-sm mb-4">
                Signed on {proposal.signedAt ? new Date(proposal.signedAt).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" }) : "N/A"}
              </p>
              {proposal.signatureData && (
                <img src={proposal.signatureData} alt="Signature" className="max-w-xs mx-auto border border-[#2A2A3E] rounded-lg" />
              )}
              <div className="mt-6 p-4 bg-[#046307]/5 rounded-lg">
                <p className="text-sm text-[#8A8A9A]">
                  Next step: Submit your deposit of <strong className="text-[#046307]">${Number(depositAmount).toLocaleString()}</strong> to begin work.
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8">
              <p className="text-[#8A8A9A] text-sm mb-6">
                By signing below, you agree to all terms and conditions stated in this proposal.
                This constitutes a legally binding agreement between you and Crown Benz.
              </p>
              <SignatureCanvas onSave={setSignatureData} width={600} height={160} />
              {signatureData && (
                <button
                  onClick={handleSign}
                  disabled={signing}
                  className="mt-6 w-full py-4 bg-[#046307] text-white font-bold text-sm rounded-xl hover:bg-[#035a06] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {signing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><CheckCircle className="w-4 h-4" /> Sign Proposal Electronically</>}
                </button>
              )}
            </div>
          )}

          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A] mb-3">Client</p>
              <div className="h-16 border-b border-[#D4AF37]/30 mb-2">
                {proposal.signatureData && <img src={proposal.signatureData} alt="" className="h-14 max-w-[200px]" />}
              </div>
              <p className="text-sm font-semibold text-[#F5F0E6]">{proposal.clientName}</p>
              <p className="text-xs text-[#5A5A6A]">{proposal.signedAt ? new Date(proposal.signedAt).toLocaleDateString() : "Pending signature"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A] mb-3">Provider</p>
              <div className="h-16 border-b border-[#D4AF37]/30 mb-2" />
              <p className="text-sm font-semibold text-[#F5F0E6]">Nwankwo Moses Ezechukwu</p>
              <p className="text-xs text-[#5A5A6A]">Crown Benz</p>
            </div>
          </div>
        </section>
      </div>

      {/* FLOATING PRINT */}
      <div className="no-print fixed bottom-6 right-6">
        <button
          onClick={handlePrint}
          className="w-14 h-14 rounded-full bg-[#D4AF37] text-[#0A0A0F] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 hover:scale-105 transition-transform"
          title="Print / Save PDF"
        >
          <Printer className="w-5 h-5" />
        </button>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-[#2A2A3E] py-8 text-center">
        <Crown className="w-5 h-5 text-[#D4AF37] mx-auto mb-2" />
        <p className="text-xs text-[#5A5A6A]">
          Crown Benz &copy; {new Date().getFullYear()} — All rights reserved.
        </p>
        <p className="text-[10px] text-[#3A3A4E] mt-1">
          Powered by Throne Notes Proposal Forge
        </p>
      </footer>
    </div>
  );
}