"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Crown, CheckCircle, Loader2, AlertCircle, Printer, Send,
  DollarSign, ArrowLeft, Clock, Repeat
} from "lucide-react";

interface InvoiceItem {
  id: string;
  itemName: string;
  description: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  imageUrl: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  businessName: string;
  businessAddress: string | null;
  businessPhone: string | null;
  businessEmail: string | null;
  businessLogo: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  subtotal: string;
  taxRate: number;
  taxAmount: string;
  discount: string;
  total: string;
  amountPaid: string;
  balanceDue: string;
  notes: string | null;
  terms: string | null;
  isRecurring: boolean;
  recurringFrequency: string | null;
  createdAt: string;
  items: InvoiceItem[];
}

const currencySymbols: Record<string, string> = {
  USD: "$", GHS: "₵", EUR: "€", GBP: "£", NGN: "₦", ZAR: "R",
};

export default function InvoiceView() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marking, setMarking] = useState(false);
  const [sending, setSending] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [createTreasuryEntry, setCreateTreasuryEntry] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`);
      const data = await res.json();
      if (data.invoice) setInvoice(data.invoice);
      else setError("Invoice not found");
    } catch (e) {
      setError("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    // placeholder for signature if needed later
  };

  const handlePrint = () => window.print();

  const handleMarkPaid = async () => {
    setMarking(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ createTreasuryEntry }),
      });
      const data = await res.json();
      if (data.success) {
        setShowPayModal(false);
        fetchInvoice();
        if (data.treasuryCreated) alert("Invoice marked as paid and recorded in Treasury Ledger.");
      }
    } catch (e) {
      alert("Failed to update");
    } finally {
      setMarking(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert("Invoice sent to client!");
        fetchInvoice();
      }
    } catch (e) {
      alert("Failed to send");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center text-[#8B0000]">
        <AlertCircle className="w-6 h-6 mr-2" /> {error || "Not found"}
      </div>
    );
  }

  const sym = currencySymbols[invoice.currency] || invoice.currency + " ";
  const isPaid = invoice.status === "paid";

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F0E6] font-[Inter,sans-serif]">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .invoice-paper {
            background: #ffffff !important;
            color: #1a1a1a !important;
            padding: 48px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .invoice-paper * { color: #1a1a1a !important; }
          .invoice-paper .print-gold { color: #8B6914 !important; }
          .invoice-paper .print-header { background: #f8f8f8 !important; border-bottom: 2px solid #D4AF37 !important; }
          .invoice-paper table th { background: #f0f0f0 !important; color: #333 !important; border-bottom: 2px solid #D4AF37 !important; }
          .invoice-paper table td { border-bottom: 1px solid #e0e0e0 !important; color: #333 !important; }
          .invoice-paper .totals-box { background: #f8f8f8 !important; border: 1px solid #e0e0e0 !important; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print sticky top-0 z-40 bg-[#0A0A0F]/90 backdrop-blur-md border-b border-[#2A2A3E] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/invoices" className="text-[#8A8A9A] hover:text-[#D4AF37] transition-colors p-1">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Crown className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-sm font-bold text-[#D4AF37]" style={{ fontFamily: "Cinzel, serif" }}>INVOICE VIEW</span>
            {invoice.isRecurring && (
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-[#D4AF37]/30 text-[#D4AF37] bg-[#D4AF37]/10">
                <Repeat className="w-3 h-3" /> {invoice.recurringFrequency}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isPaid && (
              <>
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg text-xs font-bold hover:bg-[#D4AF37]/20 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> {sending ? "Sending..." : "Send"}
                </button>
                <button
                  onClick={() => setShowPayModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#046307]/15 text-[#046307] rounded-lg text-xs font-bold hover:bg-[#046307]/25 transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Mark Paid
                </button>
              </>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#14141E] border border-[#2A2A3E] text-[#F5F0E6] rounded-lg text-xs font-bold hover:bg-[#1E1E2A] transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print / PDF
            </button>
          </div>
        </div>
      </div>

      {/* Pay Modal */}
      {showPayModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#14141E] border border-[#2A2A3E] rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-[#D4AF37] mb-4" style={{ fontFamily: "Cinzel, serif" }}>Confirm Payment</h3>
            <p className="text-sm text-[#8A8A9A] mb-6">
              Mark invoice <strong className="text-[#F5F0E6]">{invoice.invoiceNumber}</strong> as paid by <strong className="text-[#F5F0E6]">{invoice.customerName}</strong>?
            </p>
            <label className="flex items-center gap-3 cursor-pointer mb-6 p-4 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg">
              <div className={`w-10 h-6 rounded-full transition-colors relative ${createTreasuryEntry ? "bg-[#D4AF37]" : "bg-[#2A2A3E]"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${createTreasuryEntry ? "translate-x-5" : "translate-x-1"}`} />
              </div>
              <input type="checkbox" className="hidden" checked={createTreasuryEntry} onChange={(e) => setCreateTreasuryEntry(e.target.checked)} />
              <div>
                <p className="text-sm font-semibold text-[#F5F0E6]">Record in Treasury Ledger</p>
                <p className="text-xs text-[#8A8A9A]">Auto-create a sale entry in your Treasury</p>
              </div>
            </label>
            <div className="flex gap-3">
              <button onClick={() => setShowPayModal(false)} className="flex-1 py-3 border border-[#2A2A3E] text-[#8A8A9A] rounded-lg text-sm font-semibold hover:bg-[#1E1E2A]">
                Cancel
              </button>
              <button
                onClick={handleMarkPaid}
                disabled={marking}
                className="flex-1 py-3 bg-[#046307] text-white font-bold text-sm rounded-lg hover:bg-[#035a06] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {marking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {marking ? "Processing..." : "Confirm Paid"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE PAPER */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="invoice-paper bg-[#14141E] border border-[#2A2A3E] rounded-2xl p-8 md:p-12 shadow-2xl">
          
          {/* HEADER */}
          <div className="print-header flex flex-col md:flex-row justify-between items-start gap-6 pb-8 border-b-2 border-[#D4AF37]/30">
            <div className="flex items-center gap-4">
              {invoice.businessLogo && (
                <img src={invoice.businessLogo} alt="Logo" className="h-16 w-16 object-contain rounded-lg bg-white p-1" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-[#D4AF37] print-gold" style={{ fontFamily: "Cinzel, serif" }}>
                  {invoice.businessName}
                </h1>
                <p className="text-xs text-[#8A8A9A] mt-1 whitespace-pre-line">{invoice.businessAddress}</p>
                <p className="text-xs text-[#8A8A9A]">{invoice.businessPhone} {invoice.businessEmail && `• ${invoice.businessEmail}`}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#8A8A9A] mb-1">Invoice</p>
              <p className="text-3xl font-bold text-[#D4AF37] print-gold" style={{ fontFamily: "Cinzel, serif" }}>
                {invoice.invoiceNumber}
              </p>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide mt-2 ${
                isPaid ? "bg-[#046307]/10 text-[#046307]" : invoice.status === "overdue" ? "bg-[#8B0000]/10 text-[#8B0000]" : "bg-[#D4AF37]/10 text-[#D4AF37]"
              }`}>
                {isPaid ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {invoice.status}
              </div>
            </div>
          </div>

          {/* BILLING INFO */}
          <div className="grid md:grid-cols-2 gap-8 py-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A] mb-2 font-semibold">Billed To</p>
              <p className="text-lg font-bold text-[#F5F0E6]">{invoice.customerName}</p>
              <p className="text-sm text-[#8A8A9A] whitespace-pre-line mt-1">{invoice.customerAddress}</p>
              <p className="text-sm text-[#8A8A9A] mt-1">{invoice.customerPhone}</p>
              <p className="text-sm text-[#8A8A9A]">{invoice.customerEmail}</p>
            </div>
            <div className="md:text-right">
              <div className="grid grid-cols-2 gap-4 md:ml-auto md:max-w-xs">
                <div className="text-left md:text-right">
                  <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A]">Issue Date</p>
                  <p className="text-sm font-semibold">{new Date(invoice.issueDate).toLocaleDateString()}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A]">Due Date</p>
                  <p className={`text-sm font-semibold ${invoice.status === "overdue" ? "text-[#8B0000]" : "text-[#F5F0E6]"}`}>
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#D4AF37]/30">
                  <th className="text-left py-3 px-2 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Item</th>
                  <th className="text-center py-3 px-2 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Qty</th>
                  <th className="text-right py-3 px-2 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Unit Price</th>
                  <th className="text-right py-3 px-2 text-[10px] uppercase tracking-widest text-[#8A8A9A] font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-[#2A2A3E]/50">
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover border border-[#2A2A3E]" />
                        )}
                        <div>
                          <p className="font-semibold text-[#F5F0E6]">{item.itemName}</p>
                          {item.description && <p className="text-xs text-[#8A8A9A]">{item.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-center text-[#8A8A9A]">{item.quantity}</td>
                    <td className="py-4 px-2 text-right text-[#8A8A9A]">{sym}{Number(item.unitPrice).toLocaleString()}</td>
                    <td className="py-4 px-2 text-right font-bold text-[#F5F0E6]">{sym}{Number(item.totalPrice).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTALS */}
          <div className="flex justify-end pt-8">
            <div className="totals-box w-full md:w-80 bg-[#0A0A0F] border border-[#2A2A3E] rounded-xl p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#8A8A9A]">Subtotal</span>
                <span className="text-[#F5F0E6] font-semibold">{sym}{Number(invoice.subtotal).toLocaleString()}</span>
              </div>
              {Number(invoice.taxAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8A9A]">Tax ({invoice.taxRate}%)</span>
                  <span className="text-[#F5F0E6] font-semibold">{sym}{Number(invoice.taxAmount).toLocaleString()}</span>
                </div>
              )}
              {Number(invoice.discount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8A9A]">Discount</span>
                  <span className="text-[#8B0000] font-semibold">−{sym}{Number(invoice.discount).toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-[#2A2A3E] pt-3 flex justify-between items-center">
                <span className="text-[#8A8A9A] font-bold uppercase tracking-wider text-xs">Total</span>
                <span className="text-2xl font-bold text-[#D4AF37] print-gold" style={{ fontFamily: "Cinzel, serif" }}>
                  {sym}{Number(invoice.total).toLocaleString()}
                </span>
              </div>
              {isPaid ? (
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-[#046307] font-bold">Amount Paid</span>
                  <span className="text-[#046307] font-bold">{sym}{Number(invoice.amountPaid).toLocaleString()}</span>
                </div>
              ) : (
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-[#8B0000] font-bold">Balance Due</span>
                  <span className="text-[#8B0000] font-bold text-lg">{sym}{Number(invoice.balanceDue).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* NOTES & TERMS */}
          {(invoice.notes || invoice.terms) && (
            <div className="grid md:grid-cols-2 gap-8 pt-10 border-t border-[#2A2A3E]/50 mt-10">
              {invoice.notes && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A] mb-2 font-semibold">Notes</p>
                  <p className="text-sm text-[#B0B0B0] whitespace-pre-line">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#8A8A9A] mb-2 font-semibold">Terms & Conditions</p>
                  <p className="text-sm text-[#B0B0B0] whitespace-pre-line">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}

          {/* FOOTER */}
          <div className="text-center pt-12 border-t border-[#2A2A3E]/30 mt-12">
            <Crown className="w-5 h-5 text-[#D4AF37] mx-auto mb-2" />
            <p className="text-xs text-[#5A5A6A]">Thank you for your business.</p>
            <p className="text-[10px] text-[#3A3A4E] mt-1">Powered by Throne Notes Invoice Forge</p>
          </div>
        </div>
      </div>
    </div>
  );
}