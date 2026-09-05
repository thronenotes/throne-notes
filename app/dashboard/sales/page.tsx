"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Crown, Plus, Trash2, TrendingUp, TrendingDown, DollarSign,
  Calendar, Package, Loader2, X, BarChart3
} from "lucide-react";

interface Sale {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unitPrice: string;
  costPrice: string;
  totalPrice: string;
  profit: string;
  currency: string;
  notes: string | null;
  saleDate: string;
  createdAt: string;
}

interface Stats {
  totalRevenue: number;
  totalProfit: number;
  totalCost: number;
  totalTransactions: number;
  thisWeekRevenue: number;
  thisWeekProfit: number;
  thisMonthRevenue: number;
  thisMonthProfit: number;
}

const categories = [
  { key: "web_development", label: "Web Development", color: "#D4AF37" },
  { key: "mobile_app", label: "Mobile App", color: "#4B0082" },
  { key: "auto_parts", label: "Auto Parts", color: "#046307" },
  { key: "consulting", label: "Consulting", color: "#B87333" },
  { key: "branding", label: "Branding", color: "#8B0000" },
  { key: "marketing", label: "Marketing", color: "#2E86AB" },
  { key: "other", label: "Other", color: "#8A8A9A" },
];

const currencySymbols: Record<string, string> = {
  USD: "$",
  GHS: "₵",
  EUR: "€",
  GBP: "£",
  NGN: "₦",
  ZAR: "R",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
  CNY: "¥",
};

function getSymbol(currency: string) {
  return currencySymbols[currency] || currency + " ";
}

function formatMoney(amount: number, currency: string) {
  const symbol = getSymbol(currency);
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function SalesDashboard() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    itemName: "",
    category: "other",
    quantity: 1,
    unitPrice: "",
    costPrice: "",
    currency: "USD",
    notes: "",
    saleDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (user?.id) fetchSales();
  }, [user]);

  const fetchSales = async () => {
    try {
      const res = await fetch(`/api/sales?userId=${user?.id}`);
      const data = await res.json();
      setSales(data.sales || []);
      setStats(data.stats || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setForm({
          itemName: "", category: "other", quantity: 1,
          unitPrice: "", costPrice: "", currency: "USD",
          notes: "", saleDate: new Date().toISOString().split("T")[0],
        });
        fetchSales();
      }
    } catch (e) {
      alert("Failed to record sale");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this sale?")) return;
    try {
      await fetch(`/api/sales/${id}`, { method: "DELETE" });
      fetchSales();
    } catch (e) {
      alert("Failed to delete");
    }
  };

  const update = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const getCategoryLabel = (key: string) => categories.find(c => c.key === key)?.label || key;
  const getCategoryColor = (key: string) => categories.find(c => c.key === key)?.color || "#8A8A9A";

  // Use the most common currency for stats display, or default to USD
  const primaryCurrency = sales.length > 0 ? sales[0].currency : "USD";

  const profitMargin = stats && stats.totalRevenue > 0
    ? ((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F0E6] font-[Inter,sans-serif]">
      {/* Header */}
      <header className="border-b border-[#2A2A3E] px-6 py-5 flex items-center justify-between sticky top-0 bg-[#0A0A0F]/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-[#D4AF37]" />
          <div>
            <h1 className="text-sm font-bold tracking-wider text-[#D4AF37]" style={{ fontFamily: "Cinzel, serif" }}>
              TREASURY LEDGER
            </h1>
            <p className="text-[10px] text-[#5A5A6A]">Record sales. Track profit. Rule your numbers.</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#0A0A0F] rounded-lg text-xs font-bold hover:bg-[#C4A030] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Record Sale
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Revenue"
              value={formatMoney(stats.totalRevenue, primaryCurrency)}
              color="#D4AF37"
              icon={DollarSign}
            />
            <StatCard
              label="Total Profit"
              value={formatMoney(stats.totalProfit, primaryCurrency)}
              color="#046307"
              icon={TrendingUp}
            />
            <StatCard
              label="Profit Margin"
              value={`${profitMargin}%`}
              color="#4B0082"
              icon={BarChart3}
            />
            <StatCard
              label="Transactions"
              value={stats.totalTransactions.toString()}
              color="#8A8A9A"
              icon={Package}
            />
          </div>
        )}

        {/* Weekly / Monthly */}
        {stats && (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-[#14141E] border border-[#2A2A3E] rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A] mb-3">This Week</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-[#8A8A9A]">Revenue</p>
                  <p className="text-lg font-bold text-[#D4AF37]">{formatMoney(stats.thisWeekRevenue, primaryCurrency)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#8A8A9A]">Profit</p>
                  <p className="text-lg font-bold text-[#046307]">{formatMoney(stats.thisWeekProfit, primaryCurrency)}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#14141E] border border-[#2A2A3E] rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A] mb-3">This Month</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-[#8A8A9A]">Revenue</p>
                  <p className="text-lg font-bold text-[#D4AF37]">{formatMoney(stats.thisMonthRevenue, primaryCurrency)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#8A8A9A]">Profit</p>
                  <p className="text-lg font-bold text-[#046307]">{formatMoney(stats.thisMonthProfit, primaryCurrency)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sales Table */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-20 text-[#8A8A9A]">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">No sales recorded yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-[#D4AF37] text-[#0A0A0F] rounded-lg text-xs font-bold"
            >
              Record Your First Sale
            </button>
          </div>
        ) : (
          <div className="bg-[#14141E]/50 border border-[#2A2A3E] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2A2A3E] bg-[#14141E]">
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Item</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Category</th>
                    <th className="text-center px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Qty</th>
                    <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Revenue</th>
                    <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Profit</th>
                    <th className="text-center px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Date</th>
                    <th className="text-center px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b border-[#2A2A3E]/50 hover:bg-[#D4AF37]/[0.02] transition-colors">
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-[#F5F0E6]">{sale.itemName}</p>
                        {sale.notes && <p className="text-[10px] text-[#5A5A6A] mt-0.5">{sale.notes}</p>}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className="text-[10px] px-2 py-1 rounded border"
                          style={{
                            borderColor: getCategoryColor(sale.category) + "30",
                            color: getCategoryColor(sale.category),
                            background: getCategoryColor(sale.category) + "10",
                          }}
                        >
                          {getCategoryLabel(sale.category)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-[#8A8A9A]">{sale.quantity}</td>
                      <td className="px-4 py-4 text-right text-[#D4AF37] font-bold">
                        {formatMoney(Number(sale.totalPrice), sale.currency)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={Number(sale.profit) >= 0 ? "text-[#046307] font-bold" : "text-[#8B0000] font-bold"}>
                          {formatMoney(Number(sale.profit), sale.currency)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-[10px] text-[#8A8A9A]">
                        {new Date(sale.saleDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="text-[#8B0000] hover:text-[#8B0000]/70 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Sale Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#14141E] border border-[#2A2A3E] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#2A2A3E] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#D4AF37]" style={{ fontFamily: "Cinzel, serif" }}>
                Record Sale
              </h2>
              <button onClick={() => setShowForm(false)} className="text-[#8A8A9A] hover:text-[#F5F0E6]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-[#8A8A9A] mb-2 font-semibold">
                  Item / Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.itemName}
                  onChange={(e) => update("itemName", e.target.value)}
                  placeholder="e.g., E-Commerce Website"
                  className="w-full bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg px-4 py-3 text-[#F5F0E6] text-sm outline-none focus:border-[#D4AF37] placeholder:text-[#5A5A6A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#8A8A9A] mb-2 font-semibold">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg px-4 py-3 text-[#F5F0E6] text-sm outline-none focus:border-[#D4AF37]"
                  >
                    {categories.map((c) => (
                      <option key={c.key} value={c.key} className="bg-[#0A0A0F]">{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#8A8A9A] mb-2 font-semibold">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => update("quantity", parseInt(e.target.value))}
                    className="w-full bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg px-4 py-3 text-[#F5F0E6] text-sm outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#8A8A9A] mb-2 font-semibold">
                    Selling Price (per unit) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.unitPrice}
                    onChange={(e) => update("unitPrice", e.target.value)}
                    placeholder="500"
                    className="w-full bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg px-4 py-3 text-[#F5F0E6] text-sm outline-none focus:border-[#D4AF37] placeholder:text-[#5A5A6A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#8A8A9A] mb-2 font-semibold">
                    Cost Price (per unit)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.costPrice}
                    onChange={(e) => update("costPrice", e.target.value)}
                    placeholder="200"
                    className="w-full bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg px-4 py-3 text-[#F5F0E6] text-sm outline-none focus:border-[#D4AF37] placeholder:text-[#5A5A6A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#8A8A9A] mb-2 font-semibold">
                    Currency
                  </label>
                  <select
                    value={form.currency}
                    onChange={(e) => update("currency", e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg px-4 py-3 text-[#F5F0E6] text-sm outline-none focus:border-[#D4AF37]"
                  >
                    <option value="USD" className="bg-[#0A0A0F]">USD ($)</option>
                    <option value="GHS" className="bg-[#0A0A0F]">GHS (₵)</option>
                    <option value="EUR" className="bg-[#0A0A0F]">EUR (€)</option>
                    <option value="GBP" className="bg-[#0A0A0F]">GBP (£)</option>
                    <option value="NGN" className="bg-[#0A0A0F]">NGN (₦)</option>
                    <option value="ZAR" className="bg-[#0A0A0F]">ZAR (R)</option>
                    <option value="CAD" className="bg-[#0A0A0F]">CAD (C$)</option>
                    <option value="AUD" className="bg-[#0A0A0F]">AUD (A$)</option>
                    <option value="JPY" className="bg-[#0A0A0F]">JPY (¥)</option>
                    <option value="CNY" className="bg-[#0A0A0F]">CNY (¥)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#8A8A9A] mb-2 font-semibold">
                    Sale Date
                  </label>
                  <input
                    type="date"
                    value={form.saleDate}
                    onChange={(e) => update("saleDate", e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg px-4 py-3 text-[#F5F0E6] text-sm outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest text-[#8A8A9A] mb-2 font-semibold">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Optional details..."
                  rows={2}
                  className="w-full bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg px-4 py-3 text-[#F5F0E6] text-sm outline-none focus:border-[#D4AF37] placeholder:text-[#5A5A6A] resize-none"
                />
              </div>

              {/* Live Preview */}
              {form.unitPrice && (
                <div className="bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg p-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#8A8A9A]">Revenue:</span>
                    <span className="text-[#D4AF37] font-bold">
                      {formatMoney(Number(form.unitPrice) * form.quantity, form.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8A8A9A]">Est. Profit:</span>
                    <span className={Number(form.costPrice) > 0 ? "text-[#046307] font-bold" : "text-[#8A8A9A] font-bold"}>
                      {formatMoney(Number(form.unitPrice) * form.quantity - Number(form.costPrice || 0) * form.quantity, form.currency)}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !form.itemName || !form.unitPrice}
                className="w-full py-3.5 bg-[#D4AF37] text-[#0A0A0F] font-bold text-sm rounded-lg hover:bg-[#C4A030] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {submitting ? "Recording..." : "Record Sale"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }: { label: string; value: string; color: string; icon: any }) {
  return (
    <div className="bg-[#14141E] border border-[#2A2A3E] rounded-xl p-4">
      <Icon className="w-4 h-4 mb-2" style={{ color }} />
      <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A] mb-1">{label}</p>
      <p className="text-xl font-bold" style={{ color, fontFamily: "Cinzel, serif" }}>{value}</p>
    </div>
  );
}