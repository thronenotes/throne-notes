"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Crown, FileText, Send, CheckCircle, Clock, Loader2,
  ExternalLink, Search, Filter, Plus, DollarSign, Eye,
  AlertCircle, TrendingUp, Users
} from "lucide-react";

interface Proposal {
  id: string;
  contractNumber: string;
  clientName: string;
  clientEmail: string;
  projectTitle: string;
  serviceType: string;
  totalFee: string;
  depositPercent: number;
  status: string;
  createdAt: string;
  signedAt: string | null;
  viewedAt: string | null;
}

export default function ProposalsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sendingId, setSendingId] = useState("");

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await fetch("/api/proposals");
      const data = await res.json();
      setProposals(data.contracts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sendProposal = async (id: string) => {
    setSendingId(id);
    try {
      const res = await fetch(`/api/proposals/${id}/send`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert("Proposal sent to client!");
        fetchProposals();
      } else {
        alert(data.error || "Failed to send");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setSendingId("");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, any> = {
      draft: { bg: "bg-[#8A8A9A]/10", color: "text-[#8A8A9A]", icon: Clock, label: "Draft" },
      sent: { bg: "bg-[#D4AF37]/10", color: "text-[#D4AF37]", icon: Send, label: "Sent" },
      viewed: { bg: "bg-[#4B0082]/10", color: "text-[#4B0082]", icon: Eye, label: "Viewed" },
      signed: { bg: "bg-[#046307]/10", color: "text-[#046307]", icon: CheckCircle, label: "Signed" },
      deposit_paid: { bg: "bg-[#D4AF37]/10", color: "text-[#D4AF37]", icon: DollarSign, label: "Deposit Paid" },
    };
    const s = styles[status] || styles.draft;
    const Icon = s.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ${s.bg} ${s.color}`}>
        <Icon className="w-3 h-3" /> {s.label}
      </span>
    );
  };

  const filtered = proposals.filter((p) => {
    const matchesFilter = filter === "all" || p.status === filter;
    const matchesSearch =
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.contractNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.projectTitle.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: proposals.length,
    draft: proposals.filter((p) => p.status === "draft").length,
    sent: proposals.filter((p) => p.status === "sent" || p.status === "viewed").length,
    signed: proposals.filter((p) => p.status === "signed" || p.status === "deposit_paid").length,
    revenue: proposals.reduce((sum, p) => sum + Number(p.totalFee), 0),
    pipeline: proposals.filter((p) => p.status === "signed").reduce((sum, p) => sum + Number(p.totalFee), 0),
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F0E6] font-[Inter,sans-serif]">
      {/* Header */}
      <header className="border-b border-[#2A2A3E] px-6 py-5 flex items-center justify-between sticky top-0 bg-[#0A0A0F]/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-[#D4AF37]" />
          <div>
            <h1 className="text-sm font-bold tracking-wider text-[#D4AF37]" style={{ fontFamily: "Cinzel, serif" }}>
              PROPOSAL FORGE
            </h1>
            <p className="text-[10px] text-[#5A5A6A]">Contract Gate Dashboard</p>
          </div>
        </div>
        <Link
          href="/proposal"
          className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#0A0A0F] rounded-lg text-xs font-bold hover:bg-[#C4A030] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Proposal
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, color: "text-[#D4AF37]", icon: FileText },
            { label: "Drafts", value: stats.draft, color: "text-[#8A8A9A]", icon: Clock },
            { label: "In Progress", value: stats.sent, color: "text-[#4B0082]", icon: TrendingUp },
            { label: "Signed", value: stats.signed, color: "text-[#046307]", icon: CheckCircle },
            { label: "Pipeline", value: `$${stats.pipeline.toLocaleString()}`, color: "text-[#D4AF37]", icon: DollarSign },
            { label: "Total Value", value: `$${stats.revenue.toLocaleString()}`, color: "text-[#D4AF37]", icon: DollarSign },
          ].map((s) => (
            <div key={s.label} className="bg-[#14141E] border border-[#2A2A3E] rounded-xl p-4">
              <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
              <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A] mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search proposals..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#14141E] border border-[#2A2A3E] rounded-lg text-sm text-[#F5F0E6] outline-none focus:border-[#D4AF37] placeholder:text-[#5A5A6A]"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["all", "draft", "sent", "viewed", "signed", "deposit_paid"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wide whitespace-nowrap transition-all ${
                  filter === f
                    ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30"
                    : "text-[#8A8A9A] border border-[#2A2A3E] hover:border-[#3A3A4E]"
                }`}
              >
                {f === "deposit_paid" ? "Paid" : f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#8A8A9A]">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">No proposals found.</p>
            <Link href="/proposal" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#D4AF37] text-[#0A0A0F] rounded-lg text-xs font-bold">
              <Plus className="w-3.5 h-3.5" /> Create Your First Proposal
            </Link>
          </div>
        ) : (
          <div className="bg-[#14141E]/50 border border-[#2A2A3E] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2A2A3E] bg-[#14141E]">
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Proposal</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Client</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Service</th>
                    <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Value</th>
                    <th className="text-center px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Status</th>
                    <th className="text-center px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-[#2A2A3E]/50 hover:bg-[#D4AF37]/[0.02] transition-colors"
                    >
                      <td className="px-4 py-4">
                        <p className="text-[#D4AF37] font-bold text-xs">{p.contractNumber}</p>
                        <p className="text-[#F5F0E6] font-medium text-sm mt-0.5 truncate max-w-[200px]">{p.projectTitle}</p>
                        <p className="text-[#5A5A6A] text-[10px] mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-[#F5F0E6] font-medium text-sm">{p.clientName}</p>
                        <p className="text-[#8A8A9A] text-xs">{p.clientEmail}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-[#8A8A9A]">{p.serviceType}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <p className="text-[#D4AF37] font-bold">${Number(p.totalFee).toLocaleString()}</p>
                        <p className="text-[10px] text-[#8A8A9A]">{p.depositPercent}% deposit</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getStatusBadge(p.status)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/proposal/${p.id}`}
                            target="_blank"
                            className="px-3 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-md text-[11px] font-bold hover:bg-[#D4AF37]/20 transition-colors flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> View
                          </Link>
                          {(p.status === "draft" || p.status === "sent") && (
                            <button
                              onClick={() => sendProposal(p.id)}
                              disabled={sendingId === p.id}
                              className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors flex items-center gap-1 ${
                                sendingId === p.id
                                  ? "bg-[#2A2A3E] text-[#5A5A6A] cursor-not-allowed"
                                  : "bg-[#046307]/15 text-[#046307] hover:bg-[#046307]/25"
                              }`}
                            >
                              <Send className="w-3 h-3" />
                              {sendingId === p.id ? "Sending..." : "Send"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}