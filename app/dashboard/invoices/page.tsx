"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Crown, Plus, Search, Loader2, FileText, Clock, CheckCircle,
  DollarSign, AlertCircle, ArrowLeft, Send, TrendingUp, Trash2
} from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  total: string;
  balanceDue: string;
  status: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  createdAt: string;
}

const currencySymbols: Record<string, string> = {
  USD: "$", GHS: "₵", EUR: "€", GBP: "£", NGN: "₦", ZAR: "R",
};

function getSymbol(currency: string) {
  return currencySymbols[currency] || currency + " ";
}

export default function InvoicesDashboard() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    if (user?.id) fetchInvoices();
  }, [user]);

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`/api/invoices?userId=${user?.id}`);
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice permanently?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      fetchInvoices();
    } catch (e) {
      alert("Failed to delete");
    } finally {
      setDeletingId("");
    }
  };

  const filtered = invoices.filter((inv) => {
    const matchesFilter = filter === "all" || inv.status === filter;
    const matchesSearch =
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Determine primary currency from most common invoice currency
  const currencyCounts = invoices.reduce((acc, inv) => {
    acc[inv.currency] = (acc[inv.currency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const primaryCurrency = Object.entries(currencyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "USD";
  const sym = getSymbol(primaryCurrency);

  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "paid").length,
    pending: invoices.filter((i) => i.status === "sent" || i.status === "draft").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
    revenue: invoices.reduce((sum, i) => sum + Number(i.total), 0),
    outstanding: invoices.reduce((sum, i) => sum + Number(i.balanceDue), 0),
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string; label: string; icon: any }> = {
      draft: { bg: "bg-[#8A8A9A]/10", color: "text-[#8A8A9A]", label: "Draft", icon: Clock },
      sent: { bg: "bg-[#D4AF37]/10", color: "text-[#D4AF37]", label: "Sent", icon: Send },
      paid: { bg: "bg-[#046307]/10", color: "text-[#046307]", label: "Paid", icon: CheckCircle },
      overdue: { bg: "bg-[#8B0000]/10", color: "text-[#8B0000]", label: "Overdue", icon: AlertCircle },
      cancelled: { bg: "bg-[#2A2A3E]", color: "text-[#5A5A6A]", label: "Cancelled", icon: Clock },
    };
    const s = map[status] || map.draft;
    const Icon = s.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ${s.bg} ${s.color}`}>
        <Icon className="w-3 h-3" /> {s.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F0E6] font-[Inter,sans-serif]">
      <header className="border-b border-[#2A2A3E] px-6 py-5 flex items-center justify-between sticky top-0 bg-[#0A0A0F]/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-[#8A8A9A] hover:text-[#D4AF37] transition-colors p-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Crown className="w-6 h-6 text-[#D4AF37]" />
          <div>
            <h1 className="text-sm font-bold tracking-wider text-[#D4AF37]" style={{ fontFamily: "Cinzel, serif" }}>
              INVOICE FORGE
            </h1>
            <p className="text-[10px] text-[#5A5A6A]">Create. Send. Get Paid.</p>
          </div>
        </div>
        <Link
          href="/invoice/create"
          className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#0A0A0F] rounded-lg text-xs font-bold hover:bg-[#C4A030] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Invoice
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, color: "text-[#D4AF37]", icon: FileText },
            { label: "Paid", value: stats.paid, color: "text-[#046307]", icon: CheckCircle },
            { label: "Pending", value: stats.pending, color: "text-[#D4AF37]", icon: Clock },
            { label: "Overdue", value: stats.overdue, color: "text-[#8B0000]", icon: AlertCircle },
            { label: "Revenue", value: `${sym}${stats.revenue.toLocaleString()}`, color: "text-[#D4AF37]", icon: DollarSign },
            { label: "Outstanding", value: `${sym}${stats.outstanding.toLocaleString()}`, color: "text-[#8B0000]", icon: TrendingUp },
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
              placeholder="Search invoices..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#14141E] border border-[#2A2A3E] rounded-lg text-sm text-[#F5F0E6] outline-none focus:border-[#D4AF37] placeholder:text-[#5A5A6A]"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["all", "draft", "sent", "paid", "overdue"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wide whitespace-nowrap transition-all ${
                  filter === f
                    ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30"
                    : "text-[#8A8A9A] border border-[#2A2A3E] hover:border-[#3A3A4E]"
                }`}
              >
                {f}
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
            <p className="text-sm">No invoices yet.</p>
            <Link href="/invoice/create" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#D4AF37] text-[#0A0A0F] rounded-lg text-xs font-bold">
              <Plus className="w-3.5 h-3.5" /> Create First Invoice
            </Link>
          </div>
        ) : (
          <div className="bg-[#14141E]/50 border border-[#2A2A3E] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2A2A3E] bg-[#14141E]">
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Invoice</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Client</th>
                    <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Total</th>
                    <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Balance</th>
                    <th className="text-center px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Status</th>
                    <th className="text-center px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Due</th>
                    <th className="text-center px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <tr key={inv.id} className="border-b border-[#2A2A3E]/50 hover:bg-[#D4AF37]/[0.02] transition-colors">
                      <td className="px-4 py-4">
                        <p className="text-[#D4AF37] font-bold text-xs">{inv.invoiceNumber}</p>
                        <p className="text-[#5A5A6A] text-[10px] mt-0.5">{new Date(inv.issueDate).toLocaleDateString()}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-[#F5F0E6] font-medium text-sm">{inv.customerName}</p>
                        <p className="text-[#8A8A9A] text-xs">{inv.customerEmail}</p>
                      </td>
                      <td className="px-4 py-4 text-right text-[#D4AF37] font-bold">
                        {getSymbol(inv.currency)}{Number(inv.total).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={Number(inv.balanceDue) > 0 ? "text-[#8B0000] font-bold" : "text-[#046307] font-bold"}>
                          {getSymbol(inv.currency)}{Number(inv.balanceDue).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">{getStatusBadge(inv.status)}</td>
                      <td className="px-4 py-4 text-center text-[10px] text-[#8A8A9A]">
                        {new Date(inv.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/invoice/${inv.id}`}
                            className="px-3 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-md text-[11px] font-bold hover:bg-[#D4AF37]/20 transition-colors"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(inv.id)}
                            disabled={deletingId === inv.id}
                            className="text-[#8B0000] hover:text-[#8B0000]/70 transition-colors p-1.5"
                            title="Delete invoice"
                          >
                            {deletingId === inv.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
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